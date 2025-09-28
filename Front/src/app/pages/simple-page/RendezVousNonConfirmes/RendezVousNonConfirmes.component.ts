import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface RendezVousNonConfirmes {
  idFactPriseRendezVous?: number;
  id: number;
  idDimPatient: number;
  idDimActe?: number;
  idDimConfirmationRendezVous?: number;
  idDimDevis?: number;
  datePrevisionnelle: string;
  heurePrevisionnelle: string;
  commentaires: string;
}

@Component({
  selector: 'app-RendezVousNonConfirmes',
  templateUrl: './RendezVousNonConfirmes.component.html',
  styleUrls: ['./RendezVousNonConfirmes.component.scss']
})
export class RendezVousNonConfirmesComponent implements OnInit {

  rendezVousList: RendezVousNonConfirmes[] = [];
  filteredRendezVous: RendezVousNonConfirmes[] = [];
  newRendezVous: RendezVousNonConfirmes = this.initForm();
  editingRendezVous: RendezVousNonConfirmes | null = null;
  editingRendezVousId: number | null = null;

  // Calendrier
  monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  weekdayNames = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
  yearRange: number[] = [];
  calMonth: number = new Date().getMonth();
  calYear: number = new Date().getFullYear();
  calendarWeeks: (Date | null)[][] = [];
  selectedDate: string = '';
  todayRendezVousCount: number = 0;

  // API
  private apiUrl = 'http://localhost:8081/api/rendezvous-non-confirme/non-confirmes'; 

  // Popups
  addSuccess = false;
  saveSuccess = false;
  deleteSuccess = false;
  showDeleteConfirm = false;
  selectedId: number | null = null;

  searchRdv: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Initialisation
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 5; y <= currentYear + 5; y++) this.yearRange.push(y);
    this.getAll();
    this.buildCalendar();
  }

  // ---------------- FORMULAIRE ----------------
  initForm(): RendezVousNonConfirmes {
    return {
      id: 0,
      idDimPatient: 0,
      datePrevisionnelle: '',
      heurePrevisionnelle: '',
      commentaires: ''
    };
  }

  resetAddForm(form: any) {
    form.resetForm();
    this.newRendezVous = this.initForm();
  }

  // ---------------- CRUD ----------------
  getAll(): void {
    this.http.get<RendezVousNonConfirmes[]>(this.apiUrl).subscribe(data => {
      this.rendezVousList = data;
      this.filteredRendezVous = [...data];
      this.todayRendezVousCount = data.filter(r => r.datePrevisionnelle === this.formatDate(new Date())).length;
    });
  }

  create(): void {
    this.http.post<RendezVousNonConfirmes>(this.apiUrl, this.newRendezVous).subscribe(() => {
      this.getAll();
      this.newRendezVous = this.initForm();
      this.addSuccess = true;
      setTimeout(() => this.addSuccess = false, 3000);
    });
  }

  edit(rdv: RendezVousNonConfirmes): void {
    this.editingRendezVous = { ...rdv };
    this.editingRendezVousId = rdv.idFactPriseRendezVous || null;
  }

  update(): void {
    if (this.editingRendezVous && this.editingRendezVous.idFactPriseRendezVous) {
      this.http.put<RendezVousNonConfirmes>(`${this.apiUrl}/${this.editingRendezVous.idFactPriseRendezVous}`, this.editingRendezVous)
        .subscribe(() => {
          this.getAll();
          this.editingRendezVous = null;
          this.editingRendezVousId = null;
          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 3000);
        });
    }
  }

  cancelEdit(): void {
    this.editingRendezVous = null;
    this.editingRendezVousId = null;
  }

  delete(id: number | undefined): void {
    if (!id) return;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.getAll();
      this.deleteSuccess = true;
      setTimeout(() => this.deleteSuccess = false, 3000);
    });
  }

  confirmDelete(id: number | undefined) {
    this.selectedId = id || null;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.selectedId = null;
  }

  deleteRendezVous() {
    if (this.selectedId) this.delete(this.selectedId);
    this.cancelDelete();
  }

  // ---------------- CALENDRIER ----------------
  buildCalendar() {
    const firstDay = new Date(this.calYear, this.calMonth, 1);
    const lastDay = new Date(this.calYear, this.calMonth + 1, 0);

    const weeks: (Date | null)[][] = [];
    let week: (Date | null)[] = [];

    // Décalage pour lundi = 0
    let firstWeekDay = firstDay.getDay();
    firstWeekDay = firstWeekDay === 0 ? 6 : firstWeekDay - 1;

    for (let i = 0; i < firstWeekDay; i++) week.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      week.push(new Date(this.calYear, this.calMonth, d));
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    this.calendarWeeks = weeks;
  }

  formatDate(date: Date) {
    const y = date.getFullYear();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDate()).slice(-2);
    return `${y}-${m}-${d}`;
  }

  isToday(day: Date | null): boolean {
    if (!day) return false;
    const today = new Date();
    return day.getDate() === today.getDate() &&
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear();
  }

  selectCalendarDate(day: Date | null) {
    if (!day) return;
    this.selectedDate = this.formatDate(day);
    this.filteredRendezVous = this.rendezVousList.filter(r => r.datePrevisionnelle === this.selectedDate);
  }

  showTodayRendezVous() {
    const today = this.formatDate(new Date());
    this.selectedDate = today;
    this.filteredRendezVous = this.rendezVousList.filter(r => r.datePrevisionnelle === today);
  }

  resetFilters() {
    this.selectedDate = '';
    this.filteredRendezVous = [...this.rendezVousList];
  }
}
