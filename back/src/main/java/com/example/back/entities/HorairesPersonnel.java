package com.example.back.entities;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "dim_horaires_personnel")
public class HorairesPersonnel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dim_horaires_saisies")
    private Integer id;

    @Column(name = "id_utilisateur")
    private Integer idUtilisateur;

    @Column(name = "annee")
    private Integer annee;

    @Column(name = "weeknum")
    private Integer weeknum;

    @Column(name = "starttime")
    private LocalTime starttime;

    @Column(name = "endtime")
    private LocalTime endtime;

    @Column(name = "daynum")
    private Integer daynum;

    // --- Constructeurs ---
    public HorairesPersonnel() {}

    // --- Getters & Setters ---
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getIdUtilisateur() {
        return idUtilisateur;
    }

    public void setIdUtilisateur(Integer idUtilisateur) {
        this.idUtilisateur = idUtilisateur;
    }

    public Integer getAnnee() {
        return annee;
    }

    public void setAnnee(Integer annee) {
        this.annee = annee;
    }

    public Integer getWeeknum() {
        return weeknum;
    }

    public void setWeeknum(Integer weeknum) {
        this.weeknum = weeknum;
    }

    public LocalTime getStarttime() {
        return starttime;
    }

    public void setStarttime(LocalTime starttime) {
        this.starttime = starttime;
    }

    public LocalTime getEndtime() {
        return endtime;
    }

    public void setEndtime(LocalTime endtime) {
        this.endtime = endtime;
    }

    public Integer getDaynum() {
        return daynum;
    }

    public void setDaynum(Integer daynum) {
        this.daynum = daynum;
    }
}
