package com.example.back.controllers;

import com.example.back.entities.Notes;
import com.example.back.repositories.RepoNotes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:4200") 
public class NoteController {

    @Autowired
    private RepoNotes repoNotes;

    /**
     * GET /api/notes : Récupère toutes les notes.
     */
    @GetMapping
    public List<Notes> getAllNotes() {
        return repoNotes.findAll();
    }

    /**
     * GET /api/notes/{id} : Récupère une note par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Notes> getNoteById(@PathVariable(value = "id") Integer noteId) {
        Notes note = repoNotes.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note non trouvée pour l'ID :: " + noteId));
        return ResponseEntity.ok().body(note);
    }

    /**
     * POST /api/notes : Crée une nouvelle note.
     */
    @PostMapping
    public Notes createNote(@RequestBody Notes note) {
        // L'ID doit être null car il est généré par la base de données
        note.setIdNote(null);
        return repoNotes.save(note);
    }

    /**
     * PUT /api/notes/{id} : Met à jour une note existante.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Notes> updateNote(@PathVariable(value = "id") Integer noteId,
                                          @RequestBody Notes noteDetails) {
        Notes note = repoNotes.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note non trouvée pour l'ID :: " + noteId));

        note.setNote(noteDetails.getNote());
        final Notes updatedNote = repoNotes.save(note);
        return ResponseEntity.ok(updatedNote);
    }

    /**
     * DELETE /api/notes/{id} : Supprime une note par son ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable(value = "id") Integer noteId) {
        Notes note = repoNotes.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note non trouvée pour l'ID :: " + noteId));

        repoNotes.delete(note);
        return ResponseEntity.ok().build(); // Retourne un statut 200 OK sans corps
    }
}