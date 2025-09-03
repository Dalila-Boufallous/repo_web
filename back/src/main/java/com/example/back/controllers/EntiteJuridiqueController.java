package com.example.back.controllers;

import com.example.back.entities.EntiteJuridique;
import com.example.back.repositories.RepoEntiteJuridique;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/entites")
public class EntiteJuridiqueController {

    @Autowired
    private RepoEntiteJuridique repo;

    @GetMapping
    public List<EntiteJuridique> getAllEntities() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntiteJuridique> getEntiteById(@PathVariable Integer id) {
        Optional<EntiteJuridique> entite = repo.findById(id);
        return entite.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public EntiteJuridique createEntite(@RequestBody EntiteJuridique entite) {
        return repo.save(entite);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntiteJuridique> updateEntite(@PathVariable Integer id,
                                                        @RequestBody EntiteJuridique updatedEntite) {
        return repo.findById(id).map(entite -> {
            entite.setId(updatedEntite.getId());
            entite.setNom(updatedEntite.getNom());
            entite.setAdresse1(updatedEntite.getAdresse1());
            entite.setAdresse2(updatedEntite.getAdresse2());
            entite.setCodepostal(updatedEntite.getCodepostal());
            entite.setVille(updatedEntite.getVille());
            entite.setTelephone(updatedEntite.getTelephone());
            entite.setMail(updatedEntite.getMail());
            entite.setSiteweb(updatedEntite.getSiteweb());
            entite.setFormesocial(updatedEntite.getFormesocial());
            entite.setDatecreation(updatedEntite.getDatecreation());
            entite.setNumsiret(updatedEntite.getNumsiret());
            entite.setRcs(updatedEntite.getRcs());
            entite.setGerant(updatedEntite.getGerant());
            repo.save(entite);
            return ResponseEntity.ok(entite);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntite(@PathVariable Integer id) {
        return repo.findById(id).map(entite -> {
            repo.delete(entite);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
