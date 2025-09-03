package com.example.back.repositories;

import com.example.back.entities.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoUtilisateur extends JpaRepository<Utilisateur, Long> {
}
