package com.example.back.repositories;

import com.example.back.entities.RendezVousNonConfirme;
import com.example.back.entities.ConfirmationRendezVous;

import org.springframework.data.jpa.repository.Query;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoRendezVousNonConfirme extends JpaRepository<RendezVousNonConfirme,Integer> {
    
    @Query("SELECT f FROM RendezVousNonConfirme f " +
           "WHERE f.idDimConfirmationRendezVous = 0")
    List<RendezVousNonConfirme> findNonConfirmedAppointments();
}
