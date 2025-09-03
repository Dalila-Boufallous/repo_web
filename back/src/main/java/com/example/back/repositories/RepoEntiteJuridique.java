package com.example.back.repositories;

import com.example.back.entities.EntiteJuridique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoEntiteJuridique extends JpaRepository<EntiteJuridique, Integer> {
    // JpaRepository fournit déjà toutes les opérations CRUD de base
}
