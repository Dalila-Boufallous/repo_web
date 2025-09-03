package com.example.back.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dim_entite_juridique")
public class EntiteJuridique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dim_entite_juridique")
    private Integer idDimEntiteJuridique;

    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "nom", length = 100)
    private String nom;

    @Column(name = "adresse1", length = 300)
    private String adresse1;

    @Column(name = "adresse2", length = 300)
    private String adresse2;

    @Column(name = "codepostal", length = 5)
    private String codepostal;

    @Column(name = "ville", length = 100)
    private String ville;

    @Column(name = "telephone", length = 15)
    private String telephone;

    @Column(name = "mail", length = 100)
    private String mail;

    @Column(name = "siteweb", length = 150)
    private String siteweb;

    @Column(name = "formesocial", length = 40)
    private String formesocial;

    @Column(name = "datecreation")
    private LocalDateTime datecreation;

    @Column(name = "numsiret", length = 18)
    private String numsiret;

    @Column(name = "rcs", length = 100)
    private String rcs;

    @Column(name = "gerant", length = 100)
    private String gerant;

    // --- Constructeurs ---
    public EntiteJuridique() {}

    // --- Getters & Setters ---
    public Integer getIdDimEntiteJuridique() {
        return idDimEntiteJuridique;
    }

    public void setIdDimEntiteJuridique(Integer idDimEntiteJuridique) {
        this.idDimEntiteJuridique = idDimEntiteJuridique;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getAdresse1() {
        return adresse1;
    }

    public void setAdresse1(String adresse1) {
        this.adresse1 = adresse1;
    }

    public String getAdresse2() {
        return adresse2;
    }

    public void setAdresse2(String adresse2) {
        this.adresse2 = adresse2;
    }

    public String getCodepostal() {
        return codepostal;
    }

    public void setCodepostal(String codepostal) {
        this.codepostal = codepostal;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public String getSiteweb() {
        return siteweb;
    }

    public void setSiteweb(String siteweb) {
        this.siteweb = siteweb;
    }

    public String getFormesocial() {
        return formesocial;
    }

    public void setFormesocial(String formesocial) {
        this.formesocial = formesocial;
    }

    public LocalDateTime getDatecreation() {
        return datecreation;
    }

    public void setDatecreation(LocalDateTime datecreation) {
        this.datecreation = datecreation;
    }

    public String getNumsiret() {
        return numsiret;
    }

    public void setNumsiret(String numsiret) {
        this.numsiret = numsiret;
    }

    public String getRcs() {
        return rcs;
    }

    public void setRcs(String rcs) {
        this.rcs = rcs;
    }

    public String getGerant() {
        return gerant;
    }

    public void setGerant(String gerant) {
        this.gerant = gerant;
    }
}
