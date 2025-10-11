package com.example.back.controllers;

import com.example.back.entities.RappelPatient;
import com.example.back.repositories.RepoRappelPatient;

import com.example.back.services.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/rappels_patients")
public class RappelPatientController {

    @Autowired
    private RepoRappelPatient repo;

    // Tous les rappels
    @GetMapping
    public List<RappelPatient> getAll() {
        return repo.findAll();
    }

    // Un rappel par id (PK idRappelPatient)
    @GetMapping("/id/{id}")
    public ResponseEntity<RappelPatient> getOne(@PathVariable Integer id) {
        return repo.findById(id)
                   .map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // Historique d'un RDV
    @GetMapping("/by-rdv/{idRdv}")
    public List<RappelPatient> getByRdv(@PathVariable Integer idRdv) {
        return repo.findByIdRdvOrderByIdRappelPatientDesc(idRdv);
    }

    // Création
    @PostMapping
    public ResponseEntity<RappelPatient> create(@RequestBody RappelPatient in) {
        // on s'assure que JPA génère la PK
        in.setIdRappelPatient(null);
        RappelPatient saved = repo.save(in);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Modification (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<RappelPatient> update(@PathVariable Integer id,
                                                @RequestBody RappelPatient in) {
        return repo.findById(id).map(db -> {
            // on ne modifie pas la PK
            db.setIdPatient(in.getIdPatient());
            db.setIdRdv(in.getIdRdv());
            db.setMotif(in.getMotif());
            RappelPatient saved = repo.save(db);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Suppression
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
    // Récupérer tous les rappels d’un patient
    @GetMapping("/patient/{patientId}")
    public List<RappelPatient> getRappelsByPatient(@PathVariable Integer patientId) {
    return repo.findByIdPatient(patientId);
   }
   
}
