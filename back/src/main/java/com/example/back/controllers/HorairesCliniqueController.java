package com.example.back.controllers;

import com.example.back.entities.HorairesClinique;
import com.example.back.repositories.RepoHorairesClinique;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/horaires")
public class HorairesCliniqueController {

    @Autowired
    private RepoHorairesClinique repository;

    @GetMapping
    public List<HorairesClinique> getAllHoraires() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<HorairesClinique> getHoraireById(@PathVariable Integer id) {
        Optional<HorairesClinique> horaire = repository.findById(id);
        return horaire.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public HorairesClinique createHoraire(@RequestBody HorairesClinique horaire) {
        return repository.save(horaire);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HorairesClinique> updateHoraire(@PathVariable Integer id,
                                                             @RequestBody HorairesClinique updatedHoraire) {
        return repository.findById(id).map(horaire -> {
            horaire.setDte(updatedHoraire.getDte());
            horaire.setCliniqueOuvert(updatedHoraire.getCliniqueOuvert());
            repository.save(horaire);
            return ResponseEntity.ok(horaire);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHoraire(@PathVariable Integer id) {
        return repository.findById(id).map(horaire -> {
            repository.delete(horaire);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
