package com.example.back.controllers;

import com.example.back.entities.Patient;
import com.example.back.repositories.RepoPatient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private RepoPatient repository;

    // 🔹 Récupérer tous les patients
    @GetMapping
    public List<Patient> getAll() {
        return repository.findAll();
    }

    // 🔹 Récupérer un patient par ID
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getById(@PathVariable Integer id) {
        Optional<Patient> patient = repository.findById(id);
        return patient.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 Créer un nouveau patient
    @PostMapping
    public ResponseEntity<Patient> create(@RequestBody Patient patient) {
        if (patient.getIdDimPatient() != null && repository.existsById(patient.getIdDimPatient())) {
            return ResponseEntity.badRequest().build(); // éviter doublons
        }
        Patient savedPatient = repository.save(patient);
        return ResponseEntity.ok(savedPatient);
    }

    // 🔹 Mettre à jour un patient
    @PutMapping("/{id}")
    public ResponseEntity<Patient> update(@PathVariable Integer id, @RequestBody Patient patientDetails) {
        return repository.findById(id)
                .map(patient -> {
                    patient.setIdPersonne(patientDetails.getIdPersonne());
                    patient.setNom(patientDetails.getNom());
                    patient.setPrenom(patientDetails.getPrenom());
                    patient.setGenre(patientDetails.getGenre());
                    patient.setAge(patientDetails.getAge());
                    patient.setDateNaissance(patientDetails.getDateNaissance());
                    patient.setDateCreation(patientDetails.getDateCreation());
                    patient.setAssistanteResp(patientDetails.getAssistanteResp());
                    patient.setPraticienResp(patientDetails.getPraticienResp());
                    patient.setRegion(patientDetails.getRegion());
                    patient.setStatutMarital(patientDetails.getStatutMarital()); // ✅ corrigé
                    patient.setCouvertureSociale(patientDetails.getCouvertureSociale()); // ✅ corrigé

                    return ResponseEntity.ok(repository.save(patient));
                })
                .orElseGet(() -> {
                    patientDetails.setIdDimPatient(id);
                    return ResponseEntity.ok(repository.save(patientDetails));
                });
    }

    // 🔹 Supprimer un patient
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
