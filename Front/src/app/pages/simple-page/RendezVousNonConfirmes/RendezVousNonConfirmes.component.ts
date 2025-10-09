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

export interface RappelPatient {
  idRappelPatient?: number;
  idRdv: number;
  idPatient: number;
  motif: string;
}

@Component({
  selector: 'app-RendezVousNonConfirmes',
  templateUrl: './RendezVousNonConfirmes.component.html',
  styleUrls: ['./RendezVousNonConfirmes.component.scss']
})
export class RendezVousNonConfirmesComponent implements OnInit {

  // ==================== Données & états ====================
  rendezVousList: RendezVousNonConfirmes[] = [];
  filteredRendezVous: RendezVousNonConfirmes[] = [];
  newRendezVous: RendezVousNonConfirmes = this.initForm();
  editingRendezVous: RendezVousNonConfirmes | null = null;
  editingRendezVousId: number | null = null;

  // Calendrier
  monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  weekdayNames = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  yearRange: number[] = [];
  calMonth: number = new Date().getMonth();
  calYear: number = new Date().getFullYear();
  calendarWeeks: (Date | null)[][] = [];
  selectedDate: string = '';
  todayRendezVousCount: number = 0;

  // API
  private baseUrl = 'http://localhost:8081/api/rendezvous-non-confirme';
  private listUrl = this.baseUrl + '/non-confirmes';
  private rappelUrl = 'http://localhost:8081/api/rappels_patients';

  // Popups / feedback
  addSuccess = false;
  saveSuccess = false;
  deleteSuccess = false;
  rappelSuccess = false;
  showDeleteConfirm = false;
  selectedId: number | null = null;

  // Recherches
  searchRdv: string = '';
  patientIdQuery: string = '';
  rdvIdQuery: string = '';

  // Formulaire rappel
  rappel: {
    idRdv: number | null;
    idPatient: number | null;
    tentatives: number;
    motifRappel: string;
    motifRetour: string;
  } = {
    idRdv: null,
    idPatient: null,
    tentatives: 0,
    motifRappel: 'telephone',
    motifRetour: ''
  };

  selectedRdvId: number | null = null;
  selectedCardId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 5; y <= currentYear + 5; y++) this.yearRange.push(y);
    this.getAll();
    this.buildCalendar();
  }

  // ==================== FORMULAIRE RDV ====================
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

  // ==================== CRUD RDV ====================
  getAll(): void {
    this.http.get<RendezVousNonConfirmes[]>(this.listUrl).subscribe(data => {
      this.rendezVousList = data;
      this.filteredRendezVous = data.slice();
      this.todayRendezVousCount = data.filter(r => r.datePrevisionnelle === this.formatDate(new Date())).length;
      this.applyFilters();
    });
  }

  create(): void {
    this.http.post<RendezVousNonConfirmes>(this.baseUrl, this.newRendezVous).subscribe(() => {
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
    if (!this.editingRendezVous) return;

    var idForUpdate = (this.editingRendezVous.idFactPriseRendezVous !== undefined && this.editingRendezVous.idFactPriseRendezVous !== null)
      ? this.editingRendezVous.idFactPriseRendezVous
      : this.editingRendezVous.id;

    this.http.put<RendezVousNonConfirmes>(this.baseUrl + '/' + idForUpdate, this.editingRendezVous)
      .subscribe({
        next: () => {
          this.getAll();
          this.editingRendezVous = null;
          this.editingRendezVousId = null;
          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 3000);
        },
        error: (err) => {
          console.error('Update failed', err);
        }
      });
  }

  cancelEdit(): void {
    this.editingRendezVous = null;
    this.editingRendezVousId = null;
  }

  delete(id: number | undefined): void {
    if (!id) return;
    this.http.delete(this.baseUrl + '/' + id).subscribe(() => {
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

  // ==================== CALENDRIER ====================
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
    return y + '-' + m + '-' + d;
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

  // ==================== Rappels ====================
  incrementTentative() {
    this.rappel.tentatives++;
  }

  envoyerRappel() {
    // Vérifs basiques
    if (!this.rappel) {
      alert('Formulaire de rappel introuvable.');
      return;
    }
    if (this.rappel.idRdv == null || this.rappel.idPatient == null) {
      alert('Sélectionnez d’abord un rendez-vous (idRdv et idPatient sont requis).');
      return;
    }

    // Normalisations
    var tentatives = (this.rappel.tentatives == null) ? 0 : this.rappel.tentatives;
    var motifRappel = this.rappel.motifRappel ? String(this.rappel.motifRappel) : '';
    var motifRetour = this.rappel.motifRetour ? String(this.rappel.motifRetour) : '';

    // Construire le champ "motif"
    var motif = motifRappel;
    if (motifRappel === 'telephone' && motifRetour.length > 0) {
      motif = 'telephone:' + motifRetour;
    }

    // Payload
    var payload: any = {
      idPatient: Number(this.rappel.idPatient),
      idRdv: Number(this.rappel.idRdv),
      motif: motif,
      nombreTentatives: tentatives // enlever si la colonne n’existe pas côté DB
    };

    this.http.post(this.rappelUrl, payload).subscribe(
      (res: any) => {
        var retourId = null;
        if (res) {
          if (typeof res.idRappelPatient !== 'undefined' && res.idRappelPatient !== null) {
            retourId = res.idRappelPatient;
          } else if (typeof res.id !== 'undefined' && res.id !== null) {
            retourId = res.id;
          }
        }
        alert('Rappel enregistré avec succès' + (retourId !== null ? ' (id=' + retourId + ')' : '') + '.');
        this.rappel.tentatives = tentatives;
      },
      (err: any) => {
        console.error('Erreur création rappel', err);
        var messageErreur = 'Échec enregistrement rappel';
        if (err && err.error) {
          try {
            if (typeof err.error === 'string' && err.error.length > 0) {
              messageErreur = messageErreur + ' : ' + err.error;
            } else if (err.error.message) {
              messageErreur = messageErreur + ' : ' + err.error.message;
            }
          } catch (_e) { }
        }
        alert(messageErreur);
      }
    );
  }

  // ==================== Filtres ====================
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
    // 1) Date
    let base = this.selectedDate
      ? this.rendezVousList.filter(r => r.datePrevisionnelle === this.selectedDate)
      : this.rendezVousList.slice();

    // 2) ID patient (préfixe)
    const patientTokens = this.parseIdTokens(this.patientIdQuery);
    if (patientTokens.length > 0) {
      base = base.filter(r =>
        patientTokens.some(function(q) { return String(r.idDimPatient).indexOf(q) === 0; })
      );
    }

    // 3) ID RDV (préfixe)
    const rdvTokens = this.parseIdTokens(this.rdvIdQuery);
    if (rdvTokens.length > 0) {
      base = base.filter(r => {
        var rid = (r.idFactPriseRendezVous !== undefined && r.idFactPriseRendezVous !== null)
          ? r.idFactPriseRendezVous
          : r.id;
        var ridStr = String(rid);
        for (let i = 0; i < rdvTokens.length; i++) {
          if (ridStr.indexOf(rdvTokens[i]) === 0) return true;
        }
        return false;
      });
    }

    // 4) Texte global
    const term = this.normalize(this.searchRdv);
    if (!term) {
      this.filteredRendezVous = base;
      return;
    }

    this.filteredRendezVous = base.filter(rdv => {
      for (const k in rdv) {
        if (!Object.prototype.hasOwnProperty.call(rdv, k)) continue;
        const v = (rdv as any)[k];
        if (this.normalize(v).indexOf(term) !== -1) return true;
      }
      return false;
    });
  }

  prefillRappel(r: RendezVousNonConfirmes) {
    var rdvId = (r.idFactPriseRendezVous !== undefined && r.idFactPriseRendezVous !== null)
      ? r.idFactPriseRendezVous
      : r.id;

    this.selectedRdvId = rdvId;

    this.rappel.idRdv = rdvId;
    this.rappel.idPatient = r.idDimPatient;

    if (this.rappel.tentatives == null) this.rappel.tentatives = 0;
    if (!this.rappel.motifRappel) this.rappel.motifRappel = 'telephone';
    this.rappel.motifRetour = '';
  }

  resetRappelForm() {
    this.rappel = { idRdv: null, idPatient: null, tentatives: 0, motifRappel: '', motifRetour: '' };
    this.selectedRdvId = null;
    this.selectedCardId = null;
  }

  private getRdvId(r: RendezVousNonConfirmes): number {
    return (r && r.idFactPriseRendezVous != null) ? r.idFactPriseRendezVous : r.id;
  }

  // carte cliquable
  onCardClick(r: RendezVousNonConfirmes): void {
    if (!r) { return; }
    var rdvId = this.getRdvId(r);
    this.selectedCardId = rdvId;

    // Remplir le formulaire de rappel
    this.rappel.idRdv = rdvId;
    this.rappel.idPatient = r.idDimPatient;

    if (!this.rappel.motifRappel) {
      this.rappel.motifRappel = 'telephone';
    }
  }

  // savoir si une carte est sélectionnée
  isSelected(r: RendezVousNonConfirmes): boolean {
    return this.selectedCardId !== null && this.selectedCardId === this.getRdvId(r);
  }
}
