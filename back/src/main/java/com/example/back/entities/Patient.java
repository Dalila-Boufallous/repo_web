package com.example.back.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "dim_patient")

@Data

@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dim_patient")
    private Integer idDimPatient;

    @Column(name = "id_personne", nullable = true)
    private Integer idPersonne;

    @Column(name = "nom", length = 100)
    private String nom;

    @Column(name = "prenom", length = 100)
    private String prenom;

    @Column(name = "genre", length = 1)
    private String genre;

    @Column(name = "age", nullable = false)
    private Long age;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "date_creation")
    private LocalDate dateCreation;

    @Column(name = "assistante_resp")
    private Integer assistanteResp;

    @Column(name = "praticien_resp")
    private Integer praticienResp;

    @Column(name = "region", length = 100)
    private String region;

    @Column(name = "Statut_marital", length = 50)
    private String statutMarital;

    @Column(name = "Couverture_sociale", length = 50)
    private String couvertureSociale;

    @Column(name = "email")   // adapte le nom de colonne si besoin
    private String email;

    // alias explicite (optionnel si @Data, mais OK)
    public String getEmail() { 
        return email; 
    }

    // Constructeur sans-args requis par JPA
    public Patient() {}

    // (Optionnel) constructeur complet
    

    // Getters / Setters
    public Integer getIdDimPatient() { return idDimPatient; }
    public void setIdDimPatient(Integer idDimPatient) { this.idDimPatient = idDimPatient; }

    public Integer getIdPersonne() { return idPersonne; }
    public void setIdPersonne(Integer idPersonne) { this.idPersonne = idPersonne; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public Long getAge() { return age; }
    public void setAge(Long age) { this.age = age; }

    public LocalDate getDateNaissance() { return dateNaissance; }
    public void setDateNaissance(LocalDate dateNaissance) { this.dateNaissance = dateNaissance; }

    public LocalDate getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDate dateCreation) { this.dateCreation = dateCreation; }

    public Integer getAssistanteResp() { return assistanteResp; }
    public void setAssistanteResp(Integer assistanteResp) { this.assistanteResp = assistanteResp; }

    public Integer getPraticienResp() { return praticienResp; }
    public void setPraticienResp(Integer praticienResp) { this.praticienResp = praticienResp; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getStatutMarital() { return statutMarital; }
    public void setStatutMarital(String statutMarital) { this.statutMarital = statutMarital; }

    public String getCouvertureSociale() { return couvertureSociale; }
    public void setCouvertureSociale(String couvertureSociale) { this.couvertureSociale = couvertureSociale; }
}
