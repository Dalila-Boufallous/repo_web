package com.example.back.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dim_utilisateur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dim_utilisateur")
    private Integer idDimUtilisateur;

    @Column(name = "id_utilisateur")
    private Integer idUtilisateur;

    @Column(name = "nom", columnDefinition = "TEXT")
    private String nom;

    @Column(name = "prenom", columnDefinition = "TEXT")
    private String prenom;

    @Column(name = "genre", columnDefinition = "TEXT")
    private String genre;

    @Column(name = "age")
    private Integer age;

    @Column(name = "type", columnDefinition = "TEXT")
    private String type;

    @Column(name = "categorie", columnDefinition = "TEXT")
    private String categorie;

    @Column(name = "perso_actif", columnDefinition = "TEXT")
    private String persoActif;

    @Column(name = "date_embauche")
    private LocalDateTime dateEmbauche;

    @Column(name = "date_fin_contrat")
    private LocalDateTime dateFinContrat;

    @Column(name = "id_entite_juridique")
    private Integer idEntiteJuridique;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;
}
