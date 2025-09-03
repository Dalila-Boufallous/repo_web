package com.example.back.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dim_horaires_clinique")
public class HorairesClinique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dim_horaires_clinique")
    private Integer id;

    @Column(name = "dte")
    private LocalDateTime dte;

    @Column(name = "clinique_ouvert")
    private Integer cliniqueOuvert;

    // --- Constructeurs ---
    public HorairesClinique() {}

    public HorairesClinique(LocalDateTime dte, Integer cliniqueOuvert) {
        this.dte = dte;
        this.cliniqueOuvert = cliniqueOuvert;
    }

    // --- Getters & Setters ---
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDateTime getDte() {
        return dte;
    }

    public void setDte(LocalDateTime dte) {
        this.dte = dte;
    }

    public Integer getCliniqueOuvert() {
        return cliniqueOuvert;
    }

    public void setCliniqueOuvert(Integer cliniqueOuvert) {
        this.cliniqueOuvert = cliniqueOuvert;
    }
}
