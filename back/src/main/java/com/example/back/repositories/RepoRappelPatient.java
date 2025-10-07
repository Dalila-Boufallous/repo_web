package com.example.back.repository;

import com.example.back.entity.RappelPatient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoRappelPatient extends JpaRepository<RappelPatient, Integer> {
}
