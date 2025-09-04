import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface RendezVous {
  idDimConfirmationRendezVous: number;
  id: number;
  idActe: string;
  idPersonnel: string;
  idFauteuil: string;
  dateRdvConfirme: string;
  heureRdvConfirme: string;
  dateArriveePatient: string;
  heureArriveePatient: string;
  rdvDuree: number;
  heureSalleAttente: string;
  heureSortie: string;
}

@Component({
  selector: 'app-confirmation-rendez-vous',
  templateUrl: './ConfirmationRendezVous.component.html',
  styleUrls: ['./ConfirmationRendezVous.component.scss']
})
export class ConfirmationRendezVousComponent implements OnInit {

  rendezVousList: RendezVous[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  editRendezVousId: number | null = null; // idDimConfirmationRendezVous en édition
  editedRendezVous: Partial<RendezVous> = {};

  showDeleteConfirm: boolean = false;
  selectedId: number | null = null;
  deleteSuccess: boolean = false;

  private apiUrl = 'http://localhost:8081/api/rendezvous';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getRendezVous();
  }

  // Récupérer les rendez-vous
  getRendezVous(): void {
    this.loading = true;
    this.errorMessage = '';
    this.http.get<RendezVous[]>(this.apiUrl)
      .pipe(catchError((error) => this.handleError(error)))
      .subscribe({
        next: (data) => {
          this.rendezVousList = Array.isArray(data) ? data : [];
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error;
          this.loading = false;
        }
      });
  }

  // Activer le mode édition
  editRendezVous(rdv: RendezVous): void {
    this.editRendezVousId = rdv.idDimConfirmationRendezVous;
    this.editedRendezVous = { ...rdv };
  }

  // Annuler l'édition
  cancelEdit(): void {
    this.editRendezVousId = null;
    this.editedRendezVous = {};
  }

  // Sauvegarder les modifications
  saveRendezVous(): void {
    if (this.editRendezVousId === null) return;

    this.http.put<RendezVous>(`${this.apiUrl}/${this.editRendezVousId}`, this.editedRendezVous)
      .pipe(catchError((error) => this.handleError(error)))
      .subscribe({
        next: (updatedRdv) => {
          const index = this.rendezVousList.findIndex(r => r.idDimConfirmationRendezVous === updatedRdv.idDimConfirmationRendezVous);
          if (index > -1) this.rendezVousList[index] = updatedRdv;
          this.cancelEdit();
        },
        error: (error) => this.errorMessage = error
      });
  }

  // Préparer la suppression
  confirmDelete(id: number): void {
    this.selectedId = id;
    this.showDeleteConfirm = true;
  }

  // Annuler la suppression
  cancelDelete(): void {
    this.selectedId = null;
    this.showDeleteConfirm = false;
  }

  // Supprimer le rendez-vous
  delete(id: number | null): void {
    if (!id) return;

    this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(catchError((error) => this.handleError(error)))
      .subscribe({
        next: () => {
          this.rendezVousList = this.rendezVousList.filter(r => r.idDimConfirmationRendezVous !== id);
          this.showDeleteConfirm = false;
          this.deleteSuccess = true;
          setTimeout(() => this.deleteSuccess = false, 3000);
        },
        error: (error) => {
          this.errorMessage = error;
          this.showDeleteConfirm = false;
        }
      });
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse) {
    let message = '';
    if (error.error instanceof ErrorEvent) {
      message = `Erreur côté client: ${error.error.message}`;
    } else {
      message = `Erreur serveur: ${error.status} - ${error.message}`;
    }
    return throwError(() => message);
  }
}
