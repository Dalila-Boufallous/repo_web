package com.example.back.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "dim_acte")
public class Acte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_acte")
    private Integer idActe;

    @Column(name = "acte_libelle")
    private String acteLibelle;

    // === Getters  ===
    public Integer getIdActe() {
        return idActe;
    }

    public String getActeLibelle() {
        return acteLibelle;
    }
    // === Setters ===
    public void setIdActe(Integer idActe) {
        this.idActe = idActe;
    }

    public void setActeLibelle(String acteLibelle) {
        this.acteLibelle = acteLibelle;
    }
}
