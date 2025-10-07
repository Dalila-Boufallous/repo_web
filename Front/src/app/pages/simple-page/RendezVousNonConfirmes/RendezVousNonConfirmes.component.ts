import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
  private apiUrl = 'http://localhost:8081/api/rendezvous-non-confirme'; 

  // Popups
  addSuccess = false;
  saveSuccess = false;
  deleteSuccess = false;
  showDeleteConfirm = false;
  selectedId: number | null = null;

  searchRdv: string = '';

  patientIdQuery: string = '';

rdvIdQuery: string = '';

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
    this.filteredRendezVous = data.slice();
    this.todayRendezVousCount = data.filter(r => r.datePrevisionnelle === this.formatDate(new Date())).length;
    this.applyFilters(); // recalcul immédiat
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
  this.applyFilters();
}

showTodayRendezVous() {
  this.selectedDate = this.formatDate(new Date());
  this.applyFilters();
}

resetFilters() {
  this.selectedDate = '';
  this.searchRdv = '';
  this.patientIdQuery = '';
  this.rdvIdQuery = '';
  this.applyFilters();
}

  rappel = {
  idRdv: null,
  idPatient: null,
  tentatives: 0,
  motifRappel: '',
  motifRetour: ''
};

incrementTentative() {
  this.rappel.tentatives++;
}

envoyerRappel() {
  console.log('Rappel envoyé :', this.rappel);
  
}
private normalize(s: any): string {
  const str = (s === null || s === undefined) ? '' : String(s);
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}


private parseIdTokens(q: string): string[] {
  return (q || '')
    .split(/[,\s]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

applyFilters(): void {
  // 1) Point de départ: filtre date si sélectionnée
  let base = this.selectedDate
    ? this.rendezVousList.filter(r => r.datePrevisionnelle === this.selectedDate)
    : this.rendezVousList.slice();

  // 2) Filtre par ID(s) patient en "gauche→droite" (préfixe)
  const patientTokens = this.parseIdTokens(this.patientIdQuery);
  if (patientTokens.length > 0) {
    base = base.filter(r =>
      patientTokens.some(q => String(r.idDimPatient).indexOf(q) === 0) // startsWith compatible
    );
  }

  // 3) Filtre par ID(s) RDV en "gauche→droite" (préfixe)
  const rdvTokens = this.parseIdTokens(this.rdvIdQuery);
  if (rdvTokens.length > 0) {
    base = base.filter(r => {
      const rid = (r.idFactPriseRendezVous !== undefined && r.idFactPriseRendezVous !== null)
        ? r.idFactPriseRendezVous
        : r.id; // fallback si idFactPriseRendezVous absent
      const ridStr = String(rid);
      for (let i = 0; i < rdvTokens.length; i++) {
        const q = rdvTokens[i];
        if (ridStr.indexOf(q) === 0) return true; // préfixe
      }
      return false;
    });
  }

  // 4) Filtre texte global (tous champs)
  const term = this.normalize(this.searchRdv);
  if (!term) {
    this.filteredRendezVous = base;
    return;
  }

  // version compatible sans Object.values
  this.filteredRendezVous = base.filter(rdv => {
    for (const k in rdv) {
      if (!Object.prototype.hasOwnProperty.call(rdv, k)) continue;
      const v = (rdv as any)[k];
      if (this.normalize(v).indexOf(term) !== -1) return true;
    }
    return false;
  });
}





}
