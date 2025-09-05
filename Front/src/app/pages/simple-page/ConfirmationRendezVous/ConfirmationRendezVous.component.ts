import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ConfirmationRendezVous {
  idDimConfirmationRendezVous?: number;
  id: number;
  idActe: string;
  idPersonnel: string;
  idFauteuil: string;
  dateRdvConfirme: string; // yyyy-MM-dd
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

  rendezVousList: ConfirmationRendezVous[] = [];
  filteredRendezVousList: ConfirmationRendezVous[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  editRendezVousId: number | null = null;
  editedRendezVous: Partial<ConfirmationRendezVous> = {};
  showDeleteConfirm: boolean = false;
  selectedId: number | null = null;
  deleteSuccess: boolean = false;
  saveSuccess: boolean = false;

  // Ajout
  newRdv: Partial<ConfirmationRendezVous> = {};
  addSuccess: boolean = false;

  selectedDate: string = '';
  private apiUrl = 'http://localhost:8081/api/rendezvous';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // const today = new Date();
    // this.selectedDate = this.formatDate(today);
    this.getRendezVous();
    this.initCalendar();
    
  }

  getRendezVous(): void {
    this.loading = true;
    this.errorMessage = '';
    this.http.get<ConfirmationRendezVous[]>(this.apiUrl)
      .pipe(catchError(error => this.handleError(error)))
      .subscribe({
        next: data => {
          this.rendezVousList = Array.isArray(data) ? data : [];
          this.applyDateFilter();
          this.loading = false;
        },
        error: error => {
          this.errorMessage = error;
          this.loading = false;
        }
      });
  }

  applyDateFilter(): void {
    if (!this.selectedDate) {
      this.filteredRendezVousList = [...this.rendezVousList];
      return;
    }
    this.filteredRendezVousList = this.rendezVousList.filter(rdv =>
      rdv.dateRdvConfirme === this.selectedDate
    );
  }

  showTodayRendezVous(): void {
    const today = new Date();
    this.selectedDate = this.formatDate(today);
    this.applyDateFilter();
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
  }

  // Édition
  editRendezVous(rdv: ConfirmationRendezVous): void {
    this.editRendezVousId = rdv.idDimConfirmationRendezVous || null;
    this.editedRendezVous = { ...rdv };
  }

  cancelEdit(): void {
    this.editRendezVousId = null;
    this.editedRendezVous = {};
  }

  saveRendezVous(): void {
    if (this.editRendezVousId === null) return;

    this.http.put<ConfirmationRendezVous>(`${this.apiUrl}/${this.editRendezVousId}`, this.editedRendezVous)
      .pipe(catchError(error => this.handleError(error)))
      .subscribe({
        next: updatedRdv => {
          const index = this.rendezVousList.findIndex(r => r.idDimConfirmationRendezVous === updatedRdv.idDimConfirmationRendezVous);
          if (index > -1) this.rendezVousList[index] = updatedRdv;
          this.applyDateFilter();
          this.cancelEdit();

          // Popup sauvegarde
          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 3000);
        },
        error: error => this.errorMessage = error
      });
  }

  // Suppression
  confirmDelete(id: number): void {
    this.selectedId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.selectedId = null;
    this.showDeleteConfirm = false;
  }

  delete(id: number | null): void {
    if (!id) return;

    this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(error => this.handleError(error)))
      .subscribe({
        next: () => {
          this.rendezVousList = this.rendezVousList.filter(r => r.idDimConfirmationRendezVous !== id);
          this.applyDateFilter();
          this.showDeleteConfirm = false;
          this.deleteSuccess = true;
          setTimeout(() => this.deleteSuccess = false, 3000);
        },
        error: error => {
          this.errorMessage = error;
          this.showDeleteConfirm = false;
        }
      });
  }

  // Ajout
  addRendezVous(): void {
    // Réinitialiser le message d'erreur
    this.errorMessage = '';

    // Vérifier que les champs obligatoires sont remplis
    if (!this.newRdv.id || !this.newRdv.idActe || !this.newRdv.idPersonnel) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    // Créer un payload sans idDimConfirmationRendezVous
    const payload = { ...this.newRdv };
    delete payload.idDimConfirmationRendezVous;

    this.http.post<ConfirmationRendezVous>(this.apiUrl, payload)
      .pipe(catchError(error => this.handleError(error)))
      .subscribe({
        next: addedRdv => {
          this.rendezVousList.push(addedRdv);
          this.applyDateFilter();
          this.newRdv = {};
          this.addSuccess = true;

          // Réinitialiser le message succès après 3s
          setTimeout(() => this.addSuccess = false, 3000);

          // Réinitialiser le message d'erreur si succès
          this.errorMessage = '';
        },
        error: () => this.errorMessage = 'Erreur lors de l’ajout'
      });
  }

  private handleError(error: HttpErrorResponse) {
    let message = '';
    if (error.error instanceof ErrorEvent) {
      message = `Erreur côté client: ${error.error.message}`;
    } else {
      message = `Erreur serveur: ${error.status} - ${error.message}`;
    }
    return throwError(() => message);
  }
  // === mini-calendar state (à ajouter dans la classe) ===
monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
weekdayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

calYear!: number;
calMonth!: number; // 0..11
calendarWeeks: (Date | null)[][] = [];
yearRange: number[] = []; // années disponibles

initCalendar(): void {
  const now = new Date();
  // plage d'années (par ex. 1980 -> 2050, tu peux adapter)
  this.yearRange = Array.from({length: 71}, (_, i) => 1980 + i);

  if (this.selectedDate) {
    const parts = this.selectedDate.split('-').map(p => +p);
    if (parts.length === 3) {
      this.calYear = parts[0];
      this.calMonth = parts[1] - 1;
    }
  } else {
    this.calYear = now.getFullYear();
    this.calMonth = now.getMonth();
  }
  this.buildCalendar();
}

/** initialise le mini-calendrier (appelé depuis ngOnInit) */


/** construit la grille (array of weeks) */
buildCalendar(): void {
  const first = new Date(this.calYear, this.calMonth, 1);
  // Monday-first index: (0=Monday .. 6=Sunday)
  const firstWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(this.calYear, this.calMonth, d));
  while (days.length % 7 !== 0) days.push(null);

  this.calendarWeeks = [];
  for (let i = 0; i < days.length; i += 7) {
    this.calendarWeeks.push(days.slice(i, i + 7));
  }
}

/** mois précédent / suivant */
prevMonth(): void {
  this.calMonth--;
  if (this.calMonth < 0) { this.calMonth = 11; this.calYear--; }
  this.buildCalendar();
}
nextMonth(): void {
  this.calMonth++;
  if (this.calMonth > 11) { this.calMonth = 0; this.calYear++; }
  this.buildCalendar();
}

/** utilitaires */
isToday(d: Date | null): boolean {
  if (!d) return false;
  const t = new Date();
  return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth() && t.getDate() === d.getDate();
}

/** sélection d'une date dans le calendrier -> met selectedDate et applique le filtre */
selectCalendarDate(d: Date | null): void {
  if (!d) return;
  this.selectedDate = this.formatDate(d); // utilise ta méthode formatDate(date: Date)
  this.applyDateFilter();
  // conserver visuel selectionné sans fermer le calendrier
  this.buildCalendar();
}


}
