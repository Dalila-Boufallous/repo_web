package com.example.back.controllers;

import com.example.back.entities.Pointage;
import com.example.back.repositories.RepoPointage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pointages")
public class PointageController {

    @Autowired
    private RepoPointage repo;

    @GetMapping
    public List<Pointage> getAllPointages() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pointage> getPointageById(@PathVariable Integer id) {
        Optional<Pointage> pointage = repo.findById(id);
        return pointage.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Pointage createPointage(@RequestBody Pointage pointage) {
        return repo.save(pointage);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pointage> updatePointage(@PathVariable Integer id,
                                                   @RequestBody Pointage updatedPointage) {
        return repo.findById(id).map(pointage -> {
            pointage.setIdUtilisateur(updatedPointage.getIdUtilisateur());
            pointage.setDatePointage(updatedPointage.getDatePointage());
            repo.save(pointage);
            return ResponseEntity.ok(pointage);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePointage(@PathVariable Integer id) {
        return repo.findById(id).map(pointage -> {
            repo.delete(pointage);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
