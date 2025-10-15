package com.example.back.repositories;

import com.example.back.entities.Acte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoActe extends JpaRepository<Acte, Integer> {
}
