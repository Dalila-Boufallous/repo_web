package com.example.back.repositories;


import com.example.back.entities.Pointage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoPointage extends JpaRepository<Pointage, Integer> {
    // JpaRepository fournit déjà toutes les opérations CRUD
}
