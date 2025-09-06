package com.example.back.entities;

import jakarta.persistence.*;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "fact_prise_rendez_vous") 
@Data
@NoArgsConstructor
@AllArgsConstructor

public class RendezVousNonConfirme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_fact_prise_rendez_vous")
    private Long idFactPriseRendezVous;

    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "id_dim_patient", nullable = false)
    private Integer idDimPatient;

    @Column(name = "id_dim_acte", nullable = false)
    private Integer idDimActe;

    @Column(name = "id_dim_confirmation_rendez_vous", nullable = false)
    private Integer idDimConfirmationRendezVous;

    @Column(name = "id_dim_devis", nullable = false)
    private Integer idDimDevis;

    @Column(name = "date_previsionnelle", length = 19)
    private String datePrevisionnelle;

    @Column(name = "heure_previsionnelle", length = 19)
    private String heurePrevisionnelle;

    @Column(name = "commentaires", length = 2000)
    private String commentaires;

    // ----------------- Getters / Setters -----------------

    public Long getIdFactPriseRendezVous() { return idFactPriseRendezVous; }
    public void setIdFactPriseRendezVous(Long idFactPriseRendezVous) { this.idFactPriseRendezVous = idFactPriseRendezVous; }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getIdDimPatient() { return idDimPatient; }
    public void setIdDimPatient(Integer idDimPatient) { this.idDimPatient = idDimPatient; }

    public Integer getIdDimActe() { return idDimActe; }
    public void setIdDimActe(Integer idDimActe) { this.idDimActe = idDimActe; }

    public Integer getIdDimConfirmationRendezVous() { return idDimConfirmationRendezVous; }
    public void setIdDimConfirmationRendezVous(Integer idDimConfirmationRendezVous) { this.idDimConfirmationRendezVous = idDimConfirmationRendezVous; }

    public Integer getIdDimDevis() { return idDimDevis; }
    public void setIdDimDevis(Integer idDimDevis) { this.idDimDevis = idDimDevis; }

    public String getDatePrevisionnelle() { return datePrevisionnelle; }
    public void setDatePrevisionnelle(String datePrevisionnelle) { this.datePrevisionnelle = datePrevisionnelle; }

    public String getHeurePrevisionnelle() { return heurePrevisionnelle; }
    public void setHeurePrevisionnelle(String heurePrevisionnelle) { this.heurePrevisionnelle = heurePrevisionnelle; }

    public String getCommentaires() { return commentaires; }
    public void setCommentaires(String commentaires) { this.commentaires = commentaires; }
}
