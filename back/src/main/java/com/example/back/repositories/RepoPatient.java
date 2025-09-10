package com.example.back.repositories;

import com.example.back.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoPatient extends JpaRepository<Patient, Integer> {
}
