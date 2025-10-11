package com.example.back.repositories;

import com.example.back.entities.RappelPatient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepoRappelPatient extends JpaRepository<RappelPatient, Integer> {

   
    List<RappelPatient> findByIdRdvOrderByIdRappelPatientDesc(Integer idRdv);
    List<RappelPatient> findByIdPatient(Integer patientId);
}
