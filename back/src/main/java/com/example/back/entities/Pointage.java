package com.example.back.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dim_pointage")
public class Pointage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dim_pointage")
    private Integer id;

    @Column(name = "id_utilisateur", nullable = false)
    private Integer idUtilisateur;

    @Column(name = "datepointage", nullable = false)
    private LocalDateTime datePointage;

    // --- Constructeurs ---
    public Pointage() {}

    // --- Getters & Setters ---
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getIdUtilisateur() {
        return idUtilisateur;
    }

    public void setIdUtilisateur(Integer idUtilisateur) {
        this.idUtilisateur = idUtilisateur;
    }

    public LocalDateTime getDatePointage() {
        return datePointage;
    }

    public void setDatePointage(LocalDateTime datePointage) {
        this.datePointage = datePointage;
    }
}
