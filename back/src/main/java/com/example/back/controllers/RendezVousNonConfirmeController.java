package com.example.back.controllers;

import com.example.back.entities.RendezVousNonConfirme;
import com.example.back.repositories.RepoRendezVousNonConfirme;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/rendezvous-non-confirme") // nom URL standardisé en minuscules et tirets
public class RendezVousNonConfirmeController {

    @Autowired
    private RepoRendezVousNonConfirme repository;

    // Récupérer tous les rendez-vous
    @GetMapping
    public List<RendezVousNonConfirme> getAll() {
        return repository.findAll();
    }

    // Récupérer un rendez-vous par ID
    @GetMapping("/{id}")
    public ResponseEntity<RendezVousNonConfirme> getById(@PathVariable Long id) {
        Optional<RendezVousNonConfirme> rdv = repository.findById(id);
        return rdv.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    // Créer un nouveau rendez-vous
    @PostMapping
    public ResponseEntity<RendezVousNonConfirme> create(@RequestBody RendezVousNonConfirme rdv) {
        if (rdv.getIdFactPriseRendezVous() != null && repository.existsById(rdv.getIdFactPriseRendezVous())) {
            return ResponseEntity.badRequest().build(); // évite les doublons
        }
        RendezVousNonConfirme savedRdv = repository.save(rdv);
        return ResponseEntity.ok(savedRdv);
    }

    // Mettre à jour un rendez-vous
    @PutMapping("/{id}")
    public ResponseEntity<RendezVousNonConfirme> update(@PathVariable Long id, @RequestBody RendezVousNonConfirme newRdv) {
        return repository.findById(id)
                .map(rdv -> {
                    rdv.setIdDimPatient(newRdv.getIdDimPatient());
                    rdv.setIdDimActe(newRdv.getIdDimActe());
                    rdv.setIdDimConfirmationRendezVous(newRdv.getIdDimConfirmationRendezVous());
                    rdv.setIdDimDevis(newRdv.getIdDimDevis());
                    rdv.setDatePrevisionnelle(newRdv.getDatePrevisionnelle());
                    rdv.setHeurePrevisionnelle(newRdv.getHeurePrevisionnelle());
                    rdv.setCommentaires(newRdv.getCommentaires());
                    return ResponseEntity.ok(repository.save(rdv));
                })
                .orElseGet(() -> {
                    newRdv.setIdFactPriseRendezVous(id); // ✅ correction ici
                    return ResponseEntity.ok(repository.save(newRdv));
                });
    }

    // Supprimer un rendez-vous
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
