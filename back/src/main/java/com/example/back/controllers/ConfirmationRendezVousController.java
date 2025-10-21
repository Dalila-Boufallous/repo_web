package com.example.back.controllers;

import com.example.back.entities.ConfirmationRendezVous;
import com.example.back.entities.Patient;
import com.example.back.repositories.RepoConfirmationRendezVous;
import com.example.back.repositories.RepoPatient;
import com.example.back.services.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api/rendezvous")
public class ConfirmationRendezVousController {

    private static final Logger log = LoggerFactory.getLogger(ConfirmationRendezVousController.class);

    private final RepoConfirmationRendezVous repository;
    private final RepoPatient patientRepo;
    private final EmailService emailService;

    public ConfirmationRendezVousController(RepoConfirmationRendezVous repository,
                                            RepoPatient patientRepo,
                                            EmailService emailService) {
        this.repository = repository;
        this.patientRepo = patientRepo;
        this.emailService = emailService;
    }

    // ---- CRUD de base ----

    @GetMapping
    public List<ConfirmationRendezVous> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{idDim}")
    public ConfirmationRendezVous getById(@PathVariable Integer idDim) {
        return repository.findById(idDim)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rendez-vous " + idDim + " introuvable"));
    }

    @PostMapping
    public ConfirmationRendezVous create(@RequestBody ConfirmationRendezVous body) {
        return repository.save(body);
    }

    @PutMapping("/{idDim}")
    public ConfirmationRendezVous update(@PathVariable Integer idDim,
                                         @RequestBody ConfirmationRendezVous body) {
        return repository.findById(idDim)
                .map(rdv -> {
                    rdv.setIdPatient(body.getIdPatient());
                    rdv.setId(body.getId());
                    rdv.setIdActe(body.getIdActe());
                    rdv.setIdPersonnel(body.getIdPersonnel());
                    rdv.setIdFauteuil(body.getIdFauteuil());
                    rdv.setDateRdvConfirme(body.getDateRdvConfirme());
                    rdv.setHeureRdvConfirme(body.getHeureRdvConfirme());
                    rdv.setDateArriveePatient(body.getDateArriveePatient());
                    rdv.setHeureArriveePatient(body.getHeureArriveePatient());
                    rdv.setRdvDuree(body.getRdvDuree());
                    rdv.setHeureSalleAttente(body.getHeureSalleAttente());
                    rdv.setHeureSortie(body.getHeureSortie());
                    return repository.save(rdv);
                })
                .orElseGet(() -> repository.save(body));
    }

    @DeleteMapping("/{idDim}")
    public void delete(@PathVariable Integer idDim) {
        repository.deleteById(idDim);
    }

    // ---- Envoi email de rappel ----
@PostMapping("/{idDim}/email-reminder")
public ResponseEntity<Map<String, Object>> sendEmailReminder(@PathVariable("idDim") Integer idDim) {
    // 1) RDV
    ConfirmationRendezVous rdv = repository.findById(idDim)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rendez-vous " + idDim + " introuvable"));

    // 2) Patient
    Integer idPatient = rdv.getIdPatient();
    if (idPatient == null) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ce rendez-vous n’a pas de patient (idPatient null)");
    }
    Patient patient = patientRepo.findByIdPersonne(idPatient)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient " + idPatient + " introuvable"));


        // 3) Construire l’email
        String subject = "Rappel de rendez-vous";
        String body = "<p>Bonjour " + safe(patient.getPrenom()) + " " + safe(patient.getNom()) + ",</p>"
                + "<p>Ceci est un rappel pour votre rendez-vous :</p>"
                + "<ul>"
                + "<li><b>Date :</b> " + safe(rdv.getDateRdvConfirme()) + "</li>"
                + "<li><b>Heure :</b> " + safe(rdv.getHeureRdvConfirme()) + "</li>"
                + "<li><b>Acte :</b> " + safe(rdv.getIdActe()) + "</li>"
                + "</ul>"
                + "<p>Merci d'arriver 10 minutes en avance.</p>"
                + "<p>À très bientôt,</p>"
                + "<p>BandSmile</p>";

        try {
            String messageId = emailService.sendRappel(patient.getEmail(), subject, body);
            return ResponseEntity.ok(Map.of(
                    "status", "sent",
                    "to", patient.getEmail(),
                    "messageId", messageId
            ));
        } catch (RuntimeException ex) {
            log.error("Échec envoi email rdv={} patient={}", idDim, idPatient, ex);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Échec envoi email: " + ex.getMessage());
        }
    }

    private String safe(Object o) {
        return o == null ? "" : String.valueOf(o);
    }
}
