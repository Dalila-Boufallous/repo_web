package com.example.back.repositories;

import com.example.back.entities.RendezVousNonConfirme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoRendezVousNonConfirme extends JpaRepository<RendezVousNonConfirme, Long> {
    // Tu peux ajouter des méthodes custom si nécessaire
}
