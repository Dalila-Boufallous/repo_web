package com.example.back.repositories;


import com.example.back.entities.ConfirmationRendezVous;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoConfirmationRendezVous extends JpaRepository<ConfirmationRendezVous, Integer> {
}
