package com.example.back.repositories;

import com.example.back.entities.HorairesPersonnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoHorairesPersonnel extends JpaRepository<HorairesPersonnel, Integer> {
    // JpaRepository fournit déjà toutes les opérations CRUD
}
