package com.example.back.entities;

import jakarta.persistence.*;
import lombok.*;

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
    private Long idDimUtilisateur;

    @Column(name = "id_utilisateur")
    private Long idUtilisateur;

    @Column(columnDefinition = "TEXT")
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String prenom;

    @Column(columnDefinition = "TEXT")
    private String genre;

    private Long age;

    @Column(columnDefinition = "TEXT")
    private String type;

    @Column(columnDefinition = "TEXT")
    private String categorie;

    @Column(name = "perso_actif", columnDefinition = "TEXT")
    private String persoActif;

    @Column(name = "date_embauche")
    private LocalDateTime dateEmbauche;

    @Column(name = "date_fin_contrat")
    private LocalDateTime dateFinContrat;

    @Column(name = "id_entite_juridique")
    private Long idEntiteJuridique;

    @Column(name = "date_naissance")
    private LocalDateTime dateNaissance;
}
