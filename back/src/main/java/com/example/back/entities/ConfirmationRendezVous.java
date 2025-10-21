package com.example.back.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

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
    
    @Column(name = "id_patient")
    private Integer idPatient;

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


    public Integer getIdDimConfirmationRendezVous() {
    return idDimConfirmationRendezVous;
}
public void setIdDimConfirmationRendezVous(Integer idDimConfirmationRendezVous) {
    this.idDimConfirmationRendezVous = idDimConfirmationRendezVous;
}

public Integer getIdPatient() {
    return idPatient;
}
public void setIdPatient(Integer idPatient) {
    this.idPatient = idPatient;
}

public Integer getId() {
    return id;
}
public void setId(Integer id) {
    this.id = id;
}

public Integer getIdActe() {
    return idActe;
}
public void setIdActe(Integer idActe) {
    this.idActe = idActe;
}

public Integer getIdPersonnel() {
    return idPersonnel;
}
public void setIdPersonnel(Integer idPersonnel) {
    this.idPersonnel = idPersonnel;
}

public Integer getIdFauteuil() {
    return idFauteuil;
}
public void setIdFauteuil(Integer idFauteuil) {
    this.idFauteuil = idFauteuil;
}

public String getDateRdvConfirme() {
    return dateRdvConfirme;
}
public void setDateRdvConfirme(String dateRdvConfirme) {
    this.dateRdvConfirme = dateRdvConfirme;
}

public String getHeureRdvConfirme() {
    return heureRdvConfirme;
}
public void setHeureRdvConfirme(String heureRdvConfirme) {
    this.heureRdvConfirme = heureRdvConfirme;
}

public String getDateArriveePatient() {
    return dateArriveePatient;
}
public void setDateArriveePatient(String dateArriveePatient) {
    this.dateArriveePatient = dateArriveePatient;
}

public String getHeureArriveePatient() {
    return heureArriveePatient;
}
public void setHeureArriveePatient(String heureArriveePatient) {
    this.heureArriveePatient = heureArriveePatient;
}

public Integer getRdvDuree() {
    return rdvDuree;
}
public void setRdvDuree(Integer rdvDuree) {
    this.rdvDuree = rdvDuree;
}

public String getHeureSalleAttente() {
    return heureSalleAttente;
}
public void setHeureSalleAttente(String heureSalleAttente) {
    this.heureSalleAttente = heureSalleAttente;
}

public String getHeureSortie() {
    return heureSortie;
}
public void setHeureSortie(String heureSortie) {
    this.heureSortie = heureSortie;
}

}
