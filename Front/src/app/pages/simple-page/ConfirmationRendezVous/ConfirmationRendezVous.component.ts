import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

interface Utilisateur {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  genre?: string;
  age?: number;
  type?: string;
  categorie?: string;
  persoActif?: boolean;
  dateEmbauche?: string;
  dateFinContrat?: string;
  idEntiteJuridique?: number;
  dateNaissance?: string;
}

export interface ConfirmationRendezVous {
  idDimConfirmationRendezVous?: number;
  id: number;
  idPatient: number;
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

interface EmailResponse {
  status: 'sent' | 'error';
  messageId?: string;
  to?: string;
  error?: string;
}

@Component({
  selector: 'app-confirmation-rendez-vous',
  templateUrl: './ConfirmationRendezVous.component.html',
  styleUrls: ['./ConfirmationRendezVous.component.scss']
})
export class ConfirmationRendezVousComponent implements OnInit {

  rendezVousList: ConfirmationRendezVous[] = [];
  filteredRendezVousList: ConfirmationRendezVous[] = [];
  loading = false;
  errorMessage = '';
  editRendezVousId: number | null = null;
  editedRendezVous: Partial<ConfirmationRendezVous> = {};
  showDeleteConfirm = false;
  selectedId: number | null = null;
  deleteSuccess = false;
  saveSuccess = false;

  todayRendezVous: ConfirmationRendezVous[] = [];
  todayRendezVousCount = 0;

  newRdv: Partial<ConfirmationRendezVous> = {};
  addSuccess = false;

  selectedDate = '';
  private apiUrl = 'http://localhost:8081/api/rendezvous';
  actesList: string[] = [];
  personnelsList: Utilisateur[] = [];
  searchRdv = '';

  private sendingMap: Record<number, boolean> = {};

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.getRendezVous();
    this.initCalendar();
    this.calculateWeeklyRendezVous();
  }

  // ---- Récupération RDV ----
  getRendezVous(): void {
    this.loading = true;
    this.errorMessage = '';
    this.http.get<ConfirmationRendezVous[]>(this.apiUrl)
      .pipe(catchError(error => this.handleError(error)))
      .subscribe({
        next: data => {
          this.rendezVousList = Array.isArray(data) ? data : [];
          this.applyDateFilter();
          this.calculateWeeklyRendezVous();
          this.updateTodayRendezVousCount();
          this.loading = false;
        },
        error: err => {
          this.errorMessage = err;
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
    this.calculateWeeklyRendezVous();
  }

  private normalizeDateString(dateStr?: string): string | null {
    if (!dateStr) return null;
    if (dateStr.indexOf('T') >= 0) return dateStr.split('T')[0];
    if (dateStr.indexOf(' ') >= 0) return dateStr.split(' ')[0];
    return dateStr;
  }

  updateTodayRendezVousCount(): void {
    const today = this.formatDate(new Date());
    this.todayRendezVousCount = this.rendezVousList.reduce((acc, rdv) => {
      const rdvDate = this.normalizeDateString(rdv.dateRdvConfirme);
      return acc + (rdvDate === today ? 1 : 0);
    }, 0);
  }

  showTodayRendezVous(): void {
    const todayStr = this.formatDate(new Date());
    this.selectedDate = todayStr;
    this.applyDateFilter();
    this.todayRendezVousCount = this.filteredRendezVousList.length;
    this.calYear = new Date().getFullYear();
    this.calMonth = new Date().getMonth();
    this.buildCalendar();
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    return yyyy + '-' + mm + '-' + dd;
  }

  // ---- Edition ----
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

    this.http.put<ConfirmationRendezVous>(this.apiUrl + '/' + this.editRendezVousId, this.editedRendezVous)
      .pipe(catchError(error => this.handleError(error)))
      .subscribe({
        next: updatedRdv => {
          const index = this.rendezVousList.findIndex(r => r.idDimConfirmationRendezVous === updatedRdv.idDimConfirmationRendezVous);
          if (index > -1) this.rendezVousList[index] = updatedRdv;
          this.applyDateFilter();
          this.cancelEdit();
          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 3000);
        },
        error: error => this.errorMessage = error
      });
  }

  // ---- Suppression ----
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
    this.http.delete(this.apiUrl + '/' + id)
      .pipe(catchError(error => this.handleError(error)))
      .subscribe({
        next: () => {
          this.rendezVousList = this.rendezVousList.filter(r => r.idDimConfirmationRendezVous !== id);
          this.applyDateFilter();
          this.calculateWeeklyRendezVous();
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

  // ---- Ajout ----
  addRendezVous(): void {
    this.errorMessage = '';

    if (!this.newRdv.id) {
      this.errorMessage = 'Veuillez saisir un ID pour le rendez-vous.';
      return;
    }
    if (this.rendezVousList.some(r => r.id === this.newRdv.id)) {
      this.errorMessage = 'L’ID du rendez-vous existe déjà.';
      return;
    }
    if (!this.newRdv.idPatient) {
      this.errorMessage = 'Veuillez sélectionner un patient.';
      return;
    }
    if (!this.newRdv.idActe) {
      this.errorMessage = 'Veuillez sélectionner un acte.';
      return;
    }
    if (!this.newRdv.idPersonnel) {
      this.errorMessage = 'Veuillez sélectionner un personnel.';
      return;
    }
    if (!this.newRdv.idFauteuil) {
      this.errorMessage = 'Veuillez sélectionner un fauteuil.';
      return;
    }

    const payload: any = { ...this.newRdv };
    delete payload.idDimConfirmationRendezVous;

    this.http.post<ConfirmationRendezVous>(this.apiUrl, payload)
      .pipe(catchError(error => this.handleError(error)))
      .subscribe({
        next: addedRdv => {
          this.rendezVousList.push(addedRdv);
          this.applyDateFilter();
          this.newRdv = {};
          this.addSuccess = true;
          setTimeout(() => this.addSuccess = false, 3000);
          this.calculateWeeklyRendezVous();
        },
        error: () => this.errorMessage = 'Erreur lors de l’ajout'
      });
  }

  private handleError(error: HttpErrorResponse) {
    let message = '';
    if (error.error instanceof ErrorEvent) {
      message = 'Erreur côté client: ' + error.error.message;
    } else {
      message = 'Erreur serveur: ' + error.status + ' - ' + error.message;
    }
    return throwError(() => message);
  }

  // ---- Mini-calendrier ----
  monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  weekdayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  calYear!: number;
  calMonth!: number;
  calendarWeeks: (Date | null)[][] = [];
  yearRange: number[] = [];

  initCalendar(): void {
    const now = new Date();
    this.yearRange = Array.from({ length: 71 }, (_, i) => 1980 + i);
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

  buildCalendar(): void {
    const first = new Date(this.calYear, this.calMonth, 1);
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

  isToday(d: Date | null): boolean {
    if (!d) return false;
    const t = new Date();
    return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth() && t.getDate() === d.getDate();
  }

  selectCalendarDate(d: Date | null): void {
    if (!d) return;
    this.selectedDate = this.formatDate(d);
    this.applyDateFilter();
    this.calculateWeeklyRendezVous();
    this.buildCalendar();
  }

  // ---- RDV semaine ----
  weeklyRendezVousCount = 0;

  calculateWeeklyRendezVous(): void {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    this.weeklyRendezVousCount = this.rendezVousList.filter(rdv => {
      const rdvDate = new Date(rdv.dateRdvConfirme);
      return rdvDate >= monday && rdvDate <= saturday;
    }).length;
  }

  showWeekRendezVous(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    this.filteredRendezVousList = this.rendezVousList.filter(rdv => {
      const rdvDate = new Date(rdv.dateRdvConfirme);
      return rdvDate >= monday && rdvDate <= saturday;
    });

    this.calculateWeeklyRendezVous();
  }

  get filteredRendezVous(): ConfirmationRendezVous[] {
    const base = this.filteredRendezVousList;
    const term = (this.searchRdv || '').toLowerCase().trim();
    if (!term) return base;

    return base.filter(rdv => {
      return Object.entries(rdv).some(([key, value]: [string, any]) => {
        if (value === null || value === undefined) return false;
        let strValue = '';
        if (key.toLowerCase().indexOf('date') >= 0) {
          const d = new Date(String(value) + 'T00:00:00');
          if (!isNaN(d.getTime())) {
            strValue = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
          }
        } else if (typeof value === 'number') {
          strValue = String(value);
        } else {
          strValue = String(value);
        }
        return strValue.toLowerCase().includes(term);
      });
    });
  }

  showToday(): void {
    const today = new Date();
    this.selectedDate = this.formatDate(today);
    this.applyDateFilter();
    this.todayRendezVousCount = this.filteredRendezVousList.length;
  }

  clearDateFilter(): void {
    this.selectedDate = '';
    this.applyDateFilter();
    this.calculateWeeklyRendezVous();
  }

  resetFilters(): void {
    this.selectedDate = '';
    this.searchRdv = '';
    this.filteredRendezVousList = [...this.rendezVousList];
    this.todayRendezVous = [];
    this.todayRendezVousCount = 0;
    this.calculateWeeklyRendezVous();
    const now = new Date();
    this.calYear = now.getFullYear();
    this.calMonth = now.getMonth();
    this.buildCalendar();
  }

  goToPatient(id: number | null | undefined): void {
    if (!id) return;
    this.router.navigate(['patients'], { queryParams: { patientId: id } });
  }

  private getRdvKey(rdv: ConfirmationRendezVous): number {
    return rdv.idDimConfirmationRendezVous != null ? rdv.idDimConfirmationRendezVous : rdv.id;
  }

  isSending(rdv: ConfirmationRendezVous): boolean {
    const key = this.getRdvKey(rdv);
    return !!this.sendingMap[key];
  }

  // ---- EMAIL: wrapper pour éviter [object Object] ----
  sendEmailReminderFromRow(rdv: ConfirmationRendezVous) {
    const id = rdv.idDimConfirmationRendezVous != null ? rdv.idDimConfirmationRendezVous : rdv.id;
    if (typeof id !== 'number') {
      console.error('PK RDV invalide', rdv);
      alert('Identifiant de rendez-vous invalide.');
      return;
    }
    this.sendEmailReminder(id);
  }

  private showHttpError(err: HttpErrorResponse) {
    let backendMsg = '';
    if (err && err.error) {
      // Le backend Spring peut renvoyer {message: "..."} ou {error: "..."}
      const anyErr: any = err.error;
      if (anyErr.message) backendMsg = String(anyErr.message);
      else if (anyErr.error) backendMsg = String(anyErr.error);
    }
    alert('Erreur (' + err.status + '): ' + (backendMsg || err.message));
  }

  sendEmailReminder(id: number) {
    this.http.post<EmailResponse>(this.apiUrl + '/' + id + '/email-reminder', {})
      .subscribe({
        next: (res) => {
          const msgId = res && res.messageId ? (' #' + res.messageId) : '';
          alert('Rappel envoyé ✅' + msgId);
        },
        error: (err: HttpErrorResponse) => this.showHttpError(err)
      });
  }
}
