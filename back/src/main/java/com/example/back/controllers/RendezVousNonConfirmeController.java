package com.example.back.controllers;

import com.example.back.entities.RendezVousNonConfirme;
import com.example.back.repositories.RepoRendezVousNonConfirme;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/rendezvous-non-confirme")
public class RendezVousNonConfirmeController {

    private final RepoRendezVousNonConfirme repo;

    // Injection par constructeur (recommandée)
    public RendezVousNonConfirmeController(RepoRendezVousNonConfirme repo) {
        this.repo = repo;
    }

    // Récupérer tous les rendez-vous
    @GetMapping
    public List<RendezVousNonConfirme> getAll() {
        return repo.findAll();
    }

    // Récupérer un rendez-vous par ID
    @GetMapping("/{id}")
    public ResponseEntity<RendezVousNonConfirme> getById(@PathVariable Integer id) {
        Optional<RendezVousNonConfirme> rdv = repo.findById(id);
        return rdv.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    // Créer un nouveau rendez-vous
    @PostMapping
    public ResponseEntity<?> create(@RequestBody RendezVousNonConfirme in) {
        try {
            // Forcer un INSERT
            in.setIdFactPriseRendezVous(null);
            RendezVousNonConfirme saved = repo.save(in);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur création RDV : " + e.getMessage());
        }
    }

    // Mettre à jour un rendez-vous
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
                        // Si tu veux faire un upsert :
                        newRdv.setIdFactPriseRendezVous(id);
                        return ResponseEntity.ok(repo.save(newRdv));
                    });
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur update RDV : " + e.getMessage());
        }
    }

    // Supprimer un rendez-vous
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            if (!repo.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("RDV introuvable (id=" + id + ")");
            }
            repo.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur suppression RDV : " + e.getMessage());
        }
    }

    // Liste des rendez-vous non confirmés (id_dim_confirmation_rendez_vous = 0)
    @GetMapping("/non-confirmes")
    public List<RendezVousNonConfirme> getNonConfirmedAppointments() {
        List<RendezVousNonConfirme> liste = repo.findNonConfirmedAppointments();
        System.out.println("Liste des RDV non confirmés : " + liste);
        return liste;
    }
}
