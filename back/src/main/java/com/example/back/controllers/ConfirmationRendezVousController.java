package com.example.back.controllers;

import com.example.back.entities.ConfirmationRendezVous;
import com.example.back.repositories.RepoConfirmationRendezVous;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/rendezvous")
public class ConfirmationRendezVousController {

    @Autowired
    private RepoConfirmationRendezVous repository;

    // --- Récupérer tous les rendez-vous ---
    @GetMapping
    public List<ConfirmationRendezVous> getAll() {
        return repository.findAll();
    }

    // --- Récupérer un rendez-vous par ID ---
    @GetMapping("/{id}")
    public Optional<ConfirmationRendezVous> getById(@PathVariable Integer id) {
        return repository.findById(id);
    }

    // --- Créer un nouveau rendez-vous ---
    @PostMapping
    public ConfirmationRendezVous create(@RequestBody ConfirmationRendezVous rendezVous) {
        return repository.save(rendezVous);
    }

    // --- Mettre à jour un rendez-vous ---
    @PutMapping("/{id}")
    public ConfirmationRendezVous update(@PathVariable Integer id,
                                         @RequestBody ConfirmationRendezVous newRendezVous) {
        return repository.findById(id)
                .map(rdv -> {
                    rdv.setId(newRendezVous.getId());
                    rdv.setIdActe(newRendezVous.getIdActe());
                    rdv.setIdPersonnel(newRendezVous.getIdPersonnel());
                    rdv.setIdFauteuil(newRendezVous.getIdFauteuil());
                    rdv.setDateRdvConfirme(newRendezVous.getDateRdvConfirme());
                    rdv.setHeureRdvConfirme(newRendezVous.getHeureRdvConfirme());
                    rdv.setDateArriveePatient(newRendezVous.getDateArriveePatient());
                    rdv.setHeureArriveePatient(newRendezVous.getHeureArriveePatient());
                    rdv.setRdvDuree(newRendezVous.getRdvDuree());
                    rdv.setHeureSalleAttente(newRendezVous.getHeureSalleAttente());
                    rdv.setHeureSortie(newRendezVous.getHeureSortie());
                    return repository.save(rdv);
                })
                .orElseGet(() -> {
                    newRendezVous.setId(id);
                    return repository.save(newRendezVous);
                });
    }

    // --- Supprimer un rendez-vous ---
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}
