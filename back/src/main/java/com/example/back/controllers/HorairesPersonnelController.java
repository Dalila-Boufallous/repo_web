package com.example.back.controllers;

import com.example.back.entities.HorairesPersonnel;
import com.example.back.repositories.RepoHorairesPersonnel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/horaires-personnel")
public class HorairesPersonnelController {

    @Autowired
    private RepoHorairesPersonnel repo;

    @GetMapping
    public List<HorairesPersonnel> getAllHoraires() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<HorairesPersonnel> getHoraireById(@PathVariable Integer id) {
        Optional<HorairesPersonnel> horaire = repo.findById(id);
        return horaire.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public HorairesPersonnel createHoraire(@RequestBody HorairesPersonnel horaire) {
        return repo.save(horaire);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HorairesPersonnel> updateHoraire(@PathVariable Integer id,
                                                            @RequestBody HorairesPersonnel updatedHoraire) {
        return repo.findById(id).map(horaire -> {
            horaire.setIdUtilisateur(updatedHoraire.getIdUtilisateur());
            horaire.setAnnee(updatedHoraire.getAnnee());
            horaire.setWeeknum(updatedHoraire.getWeeknum());
            horaire.setStarttime(updatedHoraire.getStarttime());
            horaire.setEndtime(updatedHoraire.getEndtime());
            horaire.setDaynum(updatedHoraire.getDaynum());
            repo.save(horaire);
            return ResponseEntity.ok(horaire);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHoraire(@PathVariable Integer id) {
        return repo.findById(id).map(horaire -> {
            repo.delete(horaire);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
