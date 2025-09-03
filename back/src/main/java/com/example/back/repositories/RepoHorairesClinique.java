package com.example.back.repositories;

import com.example.back.entities.HorairesClinique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoHorairesClinique extends JpaRepository<HorairesClinique, Integer> {
    // JpaRepository fournit déjà toutes les opérations CRUD de base
}
