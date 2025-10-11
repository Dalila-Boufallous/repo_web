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
  newUtilisateur: Utilisateur = {};
  editingId: number | null = null;

  // Popups
  addSuccess = false;
  saveSuccess = false;
  deleteSuccess = false;

  showDeleteConfirm = false;
  selectedDeleteId: number | null = null;
  selectedType: string = ''; // vide = tous les types


  private baseUrl = 'http://localhost:8081/api/utilisateurs';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.http.get<Utilisateur[]>(this.baseUrl).subscribe(data => {
      this.utilisateurs = data;
    });
  }

  saveNewUtilisateur(addForm: any): void {
  if (addForm.invalid) {
    // Marque tous les champs comme touchés pour afficher les messages d'erreur
    Object.keys(addForm.controls).forEach(field => {
      const control = addForm.controls[field];
      control.markAsTouched({ onlySelf: true });
    });
    return; // Arrête l'ajout si formulaire invalide
  }

  // Si tout est valide, on ajoute
  this.http.post<Utilisateur>(this.baseUrl, this.newUtilisateur).subscribe({
    next: () => {
      this.addSuccess = true;
      setTimeout(() => this.addSuccess = false, 3000);
      this.newUtilisateur = {};
      this.loadUtilisateurs();
      addForm.resetForm(); // Réinitialise le formulaire
    },
    error: err => console.error('Erreur ajout', err)
  });
}


  startEdit(id: number): void {
    this.editingId = id;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.loadUtilisateurs();
  }

  saveUtilisateurInline(utilisateur: Utilisateur): void {
    if (!utilisateur.nom || !utilisateur.prenom || !utilisateur.age) return;
    this.http.put(`${this.baseUrl}/${utilisateur.idDimUtilisateur}`, utilisateur).subscribe({
      next: () => {
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
        this.editingId = null;
        this.loadUtilisateurs();
      },
      error: err => console.error('Erreur mise à jour', err)
    });
  }

  confirmDelete(utilisateur: Utilisateur): void {
    if (!utilisateur.idDimUtilisateur) return;
    this.selectedDeleteId = utilisateur.idDimUtilisateur;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.selectedDeleteId = null;
  }

  deleteUtilisateur(): void {
    if (!this.selectedDeleteId) return;
    this.http.delete(`${this.baseUrl}/${this.selectedDeleteId}`).subscribe({
      next: () => {
        this.deleteSuccess = true;
        setTimeout(() => this.deleteSuccess = false, 3000);
        this.showDeleteConfirm = false;
        this.selectedDeleteId = null;
        this.loadUtilisateurs();
      },
      error: err => {
        console.error('Erreur suppression', err);
        this.showDeleteConfirm = false;
      }
    });
  }
  searchTerm: string = '';

get filteredUtilisateurs() {
  const selectedType = this.selectedType ? this.selectedType.trim().toLowerCase() : '';
  const term = this.searchTerm ? this.searchTerm.trim().toLowerCase() : '';

  return this.utilisateurs.filter(u => {
    // Filtrage texte
    const matchesText = !term ||
      (u.nom && u.nom.toLowerCase().includes(term)) ||
      (u.prenom && u.prenom.toLowerCase().includes(term)) ||
      (u.idDimUtilisateur && u.idDimUtilisateur.toString().includes(term)) ||
      (u.genre && u.genre.toLowerCase().includes(term)) ||
      (u.type && u.type.toLowerCase().includes(term)) ||
      (u.categorie && u.categorie.toLowerCase().includes(term));

    // Filtrage type
    const matchesType = !selectedType || (u.type && u.type.trim().toLowerCase() === selectedType);

    return matchesText && matchesType;
  });
}
get totalMedecins(): number {
  if (!this.utilisateurs) return 0;
  return this.utilisateurs.filter(u =>
    (u.categorie || '').trim().toLowerCase() === 'med'
  ).length;
}

// Getter total Praticiens
get totalPraticiens(): number {
  if (!this.utilisateurs) return 0;
  return this.utilisateurs.filter(u =>
    (u.type || '').trim().toLowerCase() === 'praticien'
  ).length;
}




}
