import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Utilisateur {
  idDimUtilisateur?: number;
  idUtilisateur?: number;
  nom?: string;
  prenom?: string;
  genre?: string;
  age?: number;
  type?: string;
  categorie?: string;
  persoActif?: string;
  dateEmbauche?: string;
  dateFinContrat?: string;
  idEntiteJuridique?: number;
  dateNaissance?: string;
}

@Component({
  selector: 'app-personnel',
  templateUrl: './personnel.component.html',
  styleUrls: ['./personnel.component.scss']
})
export class PersonnelComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];

  // Initialisation avec tous les champs pour éviter les erreurs
  newUtilisateur: Utilisateur = {
    idDimUtilisateur: null,
    idUtilisateur: null,
    nom: '',
    prenom: '',
    genre: '',
    age: null,
    type: '',
    categorie: '',
    persoActif: '',
    dateEmbauche: '',
    dateFinContrat: '',
    idEntiteJuridique: null,
    dateNaissance: ''
  };

  editedUtilisateur: Utilisateur = {};
  editingUtilisateurId: number | null = null;

  // Messages succès
  addSuccess = false;
  saveSuccess = false;
  deleteSuccess = false;

  // Popup suppression
  showDeleteConfirm = false;
  selectedDeleteId: number | null = null;

  private baseUrl = 'http://localhost:8081/api/utilisateurs'; // ton endpoint backend

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.http.get<Utilisateur[]>(this.baseUrl).subscribe(data => {
      this.utilisateurs = data;
    });
  }

  saveUtilisateur(): void {
    if (this.editingUtilisateurId) {
      // mise à jour
      this.http.put<Utilisateur>(`${this.baseUrl}/${this.editingUtilisateurId}`, this.newUtilisateur)
        .subscribe({
          next: data => {
            this.loadUtilisateurs();
            this.saveSuccess = true;
            setTimeout(() => this.saveSuccess = false, 2000);
            this.cancelEdit();
          },
          error: err => console.error('Erreur mise à jour', err)
        });
    } else {
      // ajout
      this.http.post<Utilisateur>(this.baseUrl, this.newUtilisateur)
        .subscribe({
          next: data => {
            this.loadUtilisateurs();
            this.addSuccess = true;
            setTimeout(() => this.addSuccess = false, 2000);
            // réinitialiser le formulaire après ajout
            this.newUtilisateur = {
              idDimUtilisateur: null,
              idUtilisateur: null,
              nom: '',
              prenom: '',
              genre: '',
              age: null,
              type: '',
              categorie: '',
              persoActif: '',
              dateEmbauche: '',
              dateFinContrat: '',
              idEntiteJuridique: null,
              dateNaissance: ''
            };
          },
          error: err => console.error('Erreur ajout', err)
        });
    }
  }

  startEdit(utilisateur: Utilisateur): void {
    this.editingUtilisateurId = utilisateur.idDimUtilisateur!;
    this.newUtilisateur = { ...utilisateur };
  }

  cancelEdit(): void {
    this.editingUtilisateurId = null;
    this.newUtilisateur = {
      idDimUtilisateur: null,
      idUtilisateur: null,
      nom: '',
      prenom: '',
      genre: '',
      age: null,
      type: '',
      categorie: '',
      persoActif: '',
      dateEmbauche: '',
      dateFinContrat: '',
      idEntiteJuridique: null,
      dateNaissance: ''
    };
  }

  confirmDelete(id: number): void {
    this.selectedDeleteId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.selectedDeleteId = null;
  }

  deleteUtilisateur(): void {
    if (this.selectedDeleteId === null) return;
    this.http.delete(`${this.baseUrl}/${this.selectedDeleteId}`).subscribe(() => {
      this.loadUtilisateurs();
      this.showDeleteConfirm = false;
      this.deleteSuccess = true;
      setTimeout(() => this.deleteSuccess = false, 2000);
      this.selectedDeleteId = null;
    });
  }
}
