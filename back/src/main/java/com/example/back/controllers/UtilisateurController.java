package com.example.back.controllers;

import com.example.back.entities.Utilisateur;
import com.example.back.repositories.RepoUtilisateur;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    @Autowired
    private RepoUtilisateur repository;

    @GetMapping
    public List<Utilisateur> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Utilisateur> getById(@PathVariable Long id) {
        return repository.findById(id);
    }

    @PostMapping
    public Utilisateur create(@RequestBody Utilisateur utilisateur) {
        return repository.save(utilisateur);
    }

    @PutMapping("/{id}")
    public Utilisateur update(@PathVariable Long id, @RequestBody Utilisateur newUtilisateur) {
        return repository.findById(id)
                .map(u -> {
                    u.setIdUtilisateur(newUtilisateur.getIdUtilisateur());
                    u.setNom(newUtilisateur.getNom());
                    u.setPrenom(newUtilisateur.getPrenom());
                    u.setGenre(newUtilisateur.getGenre());
                    u.setAge(newUtilisateur.getAge());
                    u.setType(newUtilisateur.getType());
                    u.setCategorie(newUtilisateur.getCategorie());
                    u.setPersoActif(newUtilisateur.getPersoActif());
                    u.setDateEmbauche(newUtilisateur.getDateEmbauche());
                    u.setDateFinContrat(newUtilisateur.getDateFinContrat());
                    u.setIdEntiteJuridique(newUtilisateur.getIdEntiteJuridique());
                    u.setDateNaissance(newUtilisateur.getDateNaissance());
                    return repository.save(u);
                })
                .orElseGet(() -> {
                    newUtilisateur.setIdDimUtilisateur(id);
                    return repository.save(newUtilisateur);
                });
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
