package com.example.back.repositories;

import com.example.back.entities.Notes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoNotes extends JpaRepository<Notes, Integer> {
    // Aucune méthode à implémenter pour les opérations CRUD de base (find, save, delete, etc.).
    // Vous pouvez ajouter des méthodes personnalisées ici si nécessaire,
    // par exemple : List<Note> findByNoteContaining(String keyword);
}