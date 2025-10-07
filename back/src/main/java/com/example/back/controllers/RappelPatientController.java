package com.example.back.controller;

import com.example.back.entity.RappelPatient;
import com.example.back.repository.RepoRappelPatient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rappels_patients")
@CrossOrigin(origins = "http://localhost:4200") 
public class RappelPatientController {

    @Autowired
    private RepoRappelPatient RepoRappelPatient;

    // 🔹 Obtenir tous les rappels
    @GetMapping
    public List<RappelPatient> getAllRappels() {
        return RepoRappelPatient.findAll();
    }

    // 🔹 Obtenir un rappel par ID
    @GetMapping("/{id}")
    public RappelPatient getRappelById(@PathVariable Integer id) {
        return RepoRappelPatient.findById(id).orElse(null);
    }

    // 🔹 Ajouter ou modifier un rappel
    @PostMapping
    public RappelPatient createRappel(@RequestBody RappelPatient rappelPatient) {
        return RepoRappelPatient.save(rappelPatient);
    }

    // 🔹 Supprimer un rappel
    @DeleteMapping("/{id}")
    public void deleteRappel(@PathVariable Integer id) {
        RepoRappelPatient.deleteById(id);
    }
}
