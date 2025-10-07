package com.example.back.entity;

import jakarta.persistence.*;

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

    // --- Constructeurs ---
    public RappelPatient() {}

    public RappelPatient(Integer idPatient, Integer idRdv, String motif) {
        this.idPatient = idPatient;
        this.idRdv = idRdv;
        this.motif = motif;
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
}
