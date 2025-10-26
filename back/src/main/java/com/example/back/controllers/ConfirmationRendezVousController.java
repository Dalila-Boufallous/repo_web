package com.example.back.controllers;

import com.example.back.entities.ConfirmationRendezVous;
import com.example.back.entities.Patient;
import com.example.back.entities.RendezVousNonConfirme;
import com.example.back.repositories.RepoConfirmationRendezVous;
import com.example.back.repositories.RepoRendezVousNonConfirme;
import com.example.back.repositories.RepoPatient;
import com.example.back.services.EmailService;

import com.example.back.services.ConfirmationTokenService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api/rendezvous")
public class ConfirmationRendezVousController {

    private static final Logger log = LoggerFactory.getLogger(ConfirmationRendezVousController.class);
    private final RepoRendezVousNonConfirme nonConfirmeRepo;
    private final RepoConfirmationRendezVous repository;
    private final RepoPatient patientRepo;
    private final EmailService emailService;
    private final ConfirmationTokenService tokenService;

    public ConfirmationRendezVousController(RepoConfirmationRendezVous repository,
                                            RepoPatient patientRepo,
                                            EmailService emailService,RepoRendezVousNonConfirme nonConfirmeRepo,ConfirmationTokenService tokenService) {
        this.repository = repository;
        this.nonConfirmeRepo = nonConfirmeRepo; 
        this.patientRepo = patientRepo;
        this.emailService = emailService;
        this.tokenService = tokenService;
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

    @PostMapping("/confirm/{id}")
    public ResponseEntity<String> confirmRdv(@PathVariable Integer id) {
        Optional<RendezVousNonConfirme> rdvOpt = nonConfirmeRepo.findById(id);
        if (rdvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rendez-vous non confirmé introuvable");
        }

        RendezVousNonConfirme rdvNC = rdvOpt.get();

        ConfirmationRendezVous rdvC = new ConfirmationRendezVous();
        rdvC.setIdPatient(rdvNC.getIdDimPatient().intValue()); // conversion Long → Integer si nécessaire
        if (rdvNC.getIdDimActe() != null) {
            rdvC.setIdActe(rdvNC.getIdDimActe().intValue());
        }
        rdvC.setDateRdvConfirme(rdvNC.getDatePrevisionnelle());
        rdvC.setHeureRdvConfirme(rdvNC.getHeurePrevisionnelle());

        repository.save(rdvC);        // sauvegarde dans table confirmée
        nonConfirmeRepo.delete(rdvNC);     // suppression de la table non confirmée

        return ResponseEntity.ok("Rendez-vous confirmé avec succès !");
    }

    // Dans ConfirmationRendezVousController.java

@GetMapping("/confirm")
public ResponseEntity<String> confirmRdvByEmail(@RequestParam("token") String token) {

    // Déclaration des variables à la portée de la méthode
    Map<String, Long> claims;
    long rdvId;
    Optional<RendezVousNonConfirme> rdvOpt;

    // Déclarer les variables Patient en dehors du try/catch
    Optional<Patient> patientOpt;
    Patient patient; 

    try {
        // 1️⃣ Vérification du token
        claims = tokenService.verify(token);
        rdvId = claims.get("rdvId");

        // 2️⃣ Recherche du rendez-vous non confirmé
        rdvOpt = nonConfirmeRepo.findById((int) rdvId);
        if (rdvOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("<h2>❌ Rendez-vous introuvable ou déjà confirmé.</h2>");
        }

        RendezVousNonConfirme rdvNC = rdvOpt.get();

        // 🚨 ÉTAPE CLÉ : CONVERSION ID DIMENSION -> ID PATIENT NATUREL
        Integer idDimPatient = rdvNC.getIdDimPatient();

        if (idDimPatient == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("<h2>❌ Erreur: ID de la dimension Patient manquant dans le RDV non confirmé.</h2>");
        }

        // 3. Chercher l'entité Patient par son ID de dimension
        patientOpt = patientRepo.findByIdDimPatient(idDimPatient);

        if (patientOpt.isEmpty()) {
            log.error("Patient introuvable pour idDimPatient: {}", idDimPatient);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("<h2>❌ Erreur de données: Patient introuvable pour l'ID de dimension.</h2>");
        }

        patient = patientOpt.get();
        // Récupérer l'ID Patient Naturel (idPersonne) que le front-end utilise
        Integer idPatientNaturel = patient.getIdPersonne(); 

        // 4️⃣ Création d'un nouveau rendez-vous confirmé
        ConfirmationRendezVous rdvC = new ConfirmationRendezVous();
        
        // CORRECTION MAJEURE : Utilisation de l'ID Patient NATUREL
        rdvC.setIdPatient(idPatientNaturel); 
        
        // Copie des autres champs. Utilisation des noms de méthodes que j'ai pu confirmer (date/heure)
        if (rdvNC.getIdDimActe() != null) {
            rdvC.setIdActe(rdvNC.getIdDimActe().intValue());
        }
        
        // ATTENTION : Ces lignes causaient l'erreur de compilation, elles sont commentées.
        // Vous devez utiliser les getters exacts de votre entité RendezVousNonConfirme
        /* if (rdvNC.getIdDimPersonnel() != null) {
             rdvC.setIdPersonnel(rdvNC.getIdDimPersonnel().intValue());
        }
        rdvC.setIdFauteuil(rdvNC.getIdFauteuil());
        rdvC.setRdvDuree(rdvNC.getRdvDuree());
        */
        
        // Assurez-vous que ces getters existent :
        rdvC.setDateRdvConfirme(rdvNC.getDatePrevisionnelle()); 
        rdvC.setHeureRdvConfirme(rdvNC.getHeurePrevisionnelle());
        


        // 5️⃣ Enregistrement dans la table des rendez-vous confirmés
        repository.save(rdvC);

        // 6️⃣ Suppression du rendez-vous non confirmé
        nonConfirmeRepo.delete(rdvNC);

        // 7️⃣ Réponse HTML simple pour affichage dans le navigateur
        return ResponseEntity.ok("""
            <html><body style='font-family:sans-serif; text-align:center; margin-top:50px;'>
                <h2 style='color:green;'>✅ Rendez-vous confirmé avec succès !</h2>
                <p>Votre rendez-vous a été ajouté à la liste des rendez-vous confirmés.</p>
                <p>Vous pouvez fermer cette page.</p>
            </body></html>
        """);

    } catch (IllegalArgumentException ex) {
        log.warn("Token invalide ou expiré: {}", token);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("<h2>❌ Lien invalide ou expiré.</h2>");
    } catch (Exception ex) {
        log.error("Erreur inattendue lors de la confirmation du RDV avec token {}: {}", token, ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("<h2>❌ Une erreur interne est survenue lors de la confirmation.</h2>");
    }
}

}
