package com.example.back.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "dim_confirmation_rendez_vous")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmationRendezVous {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dim_confirmation_rendez_vous")
    private Integer idDimConfirmationRendezVous;

    @Column(name = "id")
    private Integer id;

    @Column(name = "id_acte")
    private Integer idActe;

    @Column(name = "id_personnel")
    private Integer idPersonnel;

    @Column(name = "id_fauteuil")
    private Integer idFauteuil;

    @Column(name = "date_rdv_confirme")
    private String dateRdvConfirme; 

    @Column(name = "heure_rdv_confirme")
    private String heureRdvConfirme;
    @Column(name = "date_arrivee_patient")
    private String dateArriveePatient;

    @Column(name = "heure_arrivee_patient")
    private String heureArriveePatient;

    @Column(name = "rdv_duree")
    private Integer rdvDuree;

    @Column(name = "heure_salle_attente")
    private String heureSalleAttente;

    @Column(name = "heure_sortie")
    private String heureSortie;
}
