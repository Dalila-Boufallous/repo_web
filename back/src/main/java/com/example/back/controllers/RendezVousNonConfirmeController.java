package com.example.back.controllers;

import com.example.back.entities.RendezVousNonConfirme;
import com.example.back.entities.Patient;
import com.example.back.repositories.RepoRendezVousNonConfirme;
import com.example.back.repositories.RepoPatient;
import com.example.back.services.EmailService;
import com.example.back.services.ConfirmationTokenService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/rendezvous-non-confirme")
public class RendezVousNonConfirmeController {

    private final RepoRendezVousNonConfirme repo;
    private final RepoPatient patientRepo;
    private final EmailService emailService;
    private final ConfirmationTokenService tokenService;

    public RendezVousNonConfirmeController(RepoRendezVousNonConfirme repo,
                                           RepoPatient patientRepo,
                                           EmailService emailService,
                                           ConfirmationTokenService tokenService) {
        this.repo = repo;
        this.patientRepo = patientRepo;
        this.emailService = emailService;
        this.tokenService = tokenService;
    }

    // ===================== CRUD =====================

    @GetMapping
    public List<RendezVousNonConfirme> getAll() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RendezVousNonConfirme> getById(@PathVariable Integer id) {
        Optional<RendezVousNonConfirme> rdv = repo.findById(id);
        return rdv.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody RendezVousNonConfirme in) {
        try {
            in.setIdFactPriseRendezVous(null); // force INSERT
            RendezVousNonConfirme saved = repo.save(in);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur création RDV : " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody RendezVousNonConfirme newRdv) {
        try {
            return repo.findById(id)
                    .map(rdv -> {
                        rdv.setIdDimPatient(newRdv.getIdDimPatient());
                        rdv.setIdDimActe(newRdv.getIdDimActe());
                        rdv.setIdDimConfirmationRendezVous(newRdv.getIdDimConfirmationRendezVous());
                        rdv.setIdDimDevis(newRdv.getIdDimDevis());
                        rdv.setDatePrevisionnelle(newRdv.getDatePrevisionnelle());
                        rdv.setHeurePrevisionnelle(newRdv.getHeurePrevisionnelle());
                        rdv.setCommentaires(newRdv.getCommentaires());
                        return ResponseEntity.ok(repo.save(rdv));
                    })
                    .orElseGet(() -> {
                        newRdv.setIdFactPriseRendezVous(id); // upsert
                        return ResponseEntity.ok(repo.save(newRdv));
                    });
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur update RDV : " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            if (!repo.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("RDV introuvable (id=" + id + ")");
            }
            repo.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur suppression RDV : " + e.getMessage());
        }
    }

    // Liste des RDV non confirmés (id_dim_confirmation_rendez_vous = 0)
    @GetMapping("/non-confirmes")
    public List<RendezVousNonConfirme> getNonConfirmedAppointments() {
        return repo.findNonConfirmedAppointments();
    }

    // ===================== Email de confirmation =====================

    /**
     * Envoie un email au patient du RDV non confirmé {id} avec un bouton "Confirmer mon rendez-vous".
     * Le lien pointe vers /api/rendezvous-non-confirme/confirm?token=...
     */
    @PostMapping("/{id}/email-confirmation")
    public ResponseEntity<Map<String, Object>> sendConfirmationEmail(@PathVariable Integer id) {
        // 1) RDV
        RendezVousNonConfirme rdv = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rendez-vous " + id + " introuvable"));

        // 2) Patient
        Integer idPatient = rdv.getIdDimPatient();
        if (idPatient == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ce rendez-vous n’a pas de patient (idDimPatient null)");
        }
        Patient patient = patientRepo.findById(idPatient)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient " + idPatient + " introuvable"));
        if (patient.getEmail() == null || patient.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le patient n’a pas d’email");
        }

        // 3) Token (⚠️ ta version prend seulement 2 params)
        long rdvIdLong = (rdv.getIdFactPriseRendezVous() != null) ? rdv.getIdFactPriseRendezVous() : rdv.getId();
        long patientIdLong = idPatient.longValue();
        String token = tokenService.generate(rdvIdLong, patientIdLong); // ✅ sans TTL

        // 4) Lien de confirmation (backend)
        String confirmUrl = "http://localhost:8081/api/rendezvous-non-confirme/confirm?token=" + token;

        // 5) Email HTML
        String subject = "Confirmez votre rendez-vous";
        String html =
                "<!doctype html><html><head><meta charset='utf-8'></head><body style='font-family:Arial,sans-serif;background:#f6f7fb;padding:24px;'>"
                        + "<div style='max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:12px;padding:20px;'>"
                        + "  <h2 style='margin-top:0;color:#222'>Bonjour " + safe(patient.getPrenom()) + " " + safe(patient.getNom()) + ",</h2>"
                        + "  <p>Vous avez un rendez-vous à confirmer :</p>"
                        + "  <ul style='line-height:1.6'>"
                        + "    <li><b>Date&nbsp;:</b> " + safe(rdv.getDatePrevisionnelle()) + "</li>"
                        + "    <li><b>Heure&nbsp;:</b> " + safe(rdv.getHeurePrevisionnelle()) + "</li>"
                        + "    <li><b>ID Patient&nbsp;:</b> " + safe(idPatient) + "</li>"
                        + "  </ul>"
                        + "  <p style='margin:18px 0'>Cliquez pour confirmer&nbsp;:</p>"
                        + "  <p style='text-align:center;margin:20px 0'>"
                        + "    <a href='" + confirmUrl + "' "
                        + "       style='display:inline-block;background:#6c5ce7;color:#fff;text-decoration:none;"
                        + "              padding:12px 18px;border-radius:10px;font-weight:700'>"
                        + "      Confirmer mon rendez-vous"
                        + "    </a>"
                        + "  </p>"
                        + "  <p style='font-size:12px;color:#666'>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>"
                        + "    <span style='word-break:break-all;color:#555'>" + confirmUrl + "</span>"
                        + "  </p>"
                        + "  <hr style='border:none;border-top:1px solid #eee;margin:20px 0'>"
                        + "  <p style='font-size:12px;color:#777;margin:0'>BandSmile – Merci de venir 10 minutes en avance.</p>"
                        + "</div>"
                        + "</body></html>";

        String messageId = emailService.sendRappel(patient.getEmail(), subject, html);

        return ResponseEntity.ok(Map.of(
                "status", "sent",
                "to", patient.getEmail(),
                "messageId", messageId,
                "confirmUrl", confirmUrl
        ));
    }

    /**
     * Cible du bouton. Vérifie le token, confirme le RDV (id_dim_confirmation_rendez_vous = 1),
     * et renvoie une petite page HTML.
     */
    @GetMapping(value = "/confirm", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> confirm(@RequestParam("token") String token) {
        try {
            Map<String, Long> claims = tokenService.verify(token);
            Long rdvIdL = claims.get("rdvId");
            Long patientIdL = claims.get("patientId");
            if (rdvIdL == null || patientIdL == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token incomplet");
            }

            int rdvId = Math.toIntExact(rdvIdL);
            int patientId = Math.toIntExact(patientIdL);

            RendezVousNonConfirme rdv = repo.findById(rdvId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rendez-vous " + rdvId + " introuvable"));

            if (!Objects.equals(rdv.getIdDimPatient(), patientId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token ne correspond pas au patient du RDV");
            }

            rdv.setIdDimConfirmationRendezVous(1); // 1 = confirmé
            repo.save(rdv);

            String okHtml =
                    "<!doctype html><html><head><meta charset='utf-8'>"
                            + "<meta name='viewport' content='width=device-width,initial-scale=1'>"
                            + "<title>Confirmation réussie</title></head>"
                            + "<body style='font-family:Arial,sans-serif;background:#f6f7fb;padding:24px;'>"
                            + "  <div style='max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:12px;padding:24px;text-align:center'>"
                            + "    <h2 style='color:#1b5e20;margin:0 0 8px'>Merci ✅</h2>"
                            + "    <p style='color:#333'>Votre rendez-vous est confirmé.</p>"
                            + "    <p style='font-size:12px;color:#666;margin-top:16px'>Vous pouvez fermer cette page.</p>"
                            + "  </div>"
                            + "</body></html>";

            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(okHtml);

        } catch (IllegalArgumentException ex) {
            String errHtml =
                    "<!doctype html><html><head><meta charset='utf-8'><title>Token invalide</title></head>"
                            + "<body style='font-family:Arial,sans-serif;background:#f6f7fb;padding:24px;'>"
                            + "  <div style='max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:12px;padding:24px;text-align:center'>"
                            + "    <h3 style='color:#b71c1c;margin:0 0 8px'>Lien invalide ou expiré</h3>"
                            + "    <p style='color:#333'>Merci de contacter le cabinet pour un nouveau lien.</p>"
                            + "  </div>"
                            + "</body></html>";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_HTML)
                    .body(errHtml);
        }
    }

    // ===================== Utilitaire =====================
    private String safe(Object o) {
        return o == null ? "" : String.valueOf(o);
    }
}
