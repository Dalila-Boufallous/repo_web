package com.example.back.entities;

import jakarta.persistence.*;
import com.example.back.services.EmailService;

@Entity
@Table(name = "rappel_patient")
public class RappelPatient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rappel_patient")
    private Integer idRappelPatient;

    @Column(name = "id_patient", nullable = false)
    private Integer idPatient;

    @Column(name = "id_rdv", nullable = false)
    private Integer idRdv;

    @Column(name = "motif", length = 100)
    private String motif;

    @Column(name = "nombre_tentatives", nullable = false)
    private Integer nombreTentatives;

    // --- Constructeurs ---
    public RappelPatient() {
    }

    public RappelPatient(Integer idPatient, Integer idRdv, String motif, Integer nombreTentatives) {
        this.idPatient = idPatient;
        this.idRdv = idRdv;
        this.motif = motif;
        this.nombreTentatives = nombreTentatives;
    }

    // --- Getters & Setters ---
    public Integer getIdRappelPatient() {
        return idRappelPatient;
    }

    public void setIdRappelPatient(Integer idRappelPatient) {
        this.idRappelPatient = idRappelPatient;
    }

    public Integer getIdPatient() {
        return idPatient;
    }

    public void setIdPatient(Integer idPatient) {
        this.idPatient = idPatient;
    }

    public Integer getIdRdv() {
        return idRdv;
    }

    public void setIdRdv(Integer idRdv) {
        this.idRdv = idRdv;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public Integer getNombreTentatives() {
        return nombreTentatives;
    }

    public void setNombreTentatives(Integer nombreTentatives) {
        this.nombreTentatives = nombreTentatives;
    }

    // --- Hooks JPA ---
    @PrePersist
    public void prePersist() {
        if (this.nombreTentatives == null) {
            this.nombreTentatives = 0;
        }
        if (this.motif != null && this.motif.length() > 100) {
            this.motif = this.motif.substring(0, 100);
        }
    }
   
}
