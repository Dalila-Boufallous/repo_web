package com.example.back.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "notes")
public class Notes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_note")
    private Integer idNote; // Utiliser Long pour la clé primaire INT auto-incrémentée

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "type", columnDefinition = "TEXT")
    private String type;

    // Constructeur par défaut (nécessaire pour JPA)
    public Notes() {
    }

    // Constructeur avec tous les champs (sauf l'ID)
    public Notes(String note) {
        this.note = note;
    }

    // --- Getters et Setters ---

    public Integer getIdNote() {
        return idNote;
    }

    public void setIdNote(Integer idNote) {
        this.idNote = idNote;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

     public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}