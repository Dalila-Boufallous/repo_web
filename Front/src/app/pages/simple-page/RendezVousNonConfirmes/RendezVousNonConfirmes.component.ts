import { Component, OnInit, QueryList, ViewChildren, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


export interface RendezVousNonConfirmes  {
  idFactPriseRendezVous?: number;
  id: number;
  idDimPatient: number;
  idDimActe?: number;
  idDimConfirmationRendezVous?: number;
  idDimDevis?: number;
  datePrevisionnelle: string;
  heurePrevisionnelle: string;
  commentaires: string;
  nomPatient?: string;
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
  newRendezVous: RendezVousNonConfirmes & { selectedPatientId?: number } = this.initForm();
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
  showDeleteConfirm: boolean = false;
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
  weekNonConfirmed: RendezVousNonConfirmes[] = []; 
  patients: any[] = [];
  sendingEmailId: number | null = null;
  patientMap: { [id: number]: any } = {}; 

  constructor(private http: HttpClient) {}

 ngOnInit(): void {
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 5; y <= currentYear + 5; y++) this.yearRange.push(y);

  // Charger d’abord les patients
  this.http.get<any[]>('http://localhost:8081/api/patients').subscribe(pats => {
  this.patients = pats;
  this.patientMap = {};
  this.patients.forEach(p => {
  this.patientMap[p.idDimPatient] = p;
  
  });
  this.getAll(); 
});

  this.buildCalendar();
  this.calculerStats();
}

 getPatientName(id: number): string {
  const p = this.patientMap[Number(id)];
  if (p) {
    return `${p.nom} ${p.prenom || ''}`;
  } else {
    return 'Inconnu';
  }
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
    // Affecter la liste
    this.rendezVousList = data;

    // Ajouter le nom du patient pour chaque RDV
    this.rendezVousList.forEach(rdv => {
      rdv.nomPatient = this.getPatientName(rdv.idDimPatient);
    });

  console.table(this.rendezVousList.map(r => ({
  rdvId: r.id,
  patientId: r.idDimPatient,
  nomTrouve: this.getPatientName(r.idDimPatient)
})));


    this.filteredRendezVous = this.rendezVousList.slice();
    this.todayRendezVousCount = this.rendezVousList.filter(r => r.datePrevisionnelle === this.formatDate(new Date())).length;
    this.applyFilters();
  });
  console.log('Rendez-vous IDs:', this.rendezVousList.map(r => r.idDimPatient));
  console.log('Patient IDs:', this.patients.map(p => p.idDimPatient));

}


private toHHmmss(t: string | null | undefined): string | null {
  if (!t) return null;                 // "14:05" -> "14:05:00"
  if (/^\d{2}:\d{2}$/.test(t)) return t + ':00';
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
  return null;
}


filteredPatients(): any[] {
  if (!this.editingRendezVous || !this.editingRendezVous.nomPatient) {
    return this.patients; // renvoie tous les patients si le champ est vide
  }
  const search = this.editingRendezVous.nomPatient.toLowerCase();
  return this.patients.filter(p => 
    (`${p.nom} ${p.prenom}`).toLowerCase().includes(search)
  );
}

// Retourne la liste filtrée des patients pour l'édition
getFilteredPatients(): any[] {
  if (!this.editingRendezVous || !this.editingRendezVous.nomPatient) {
    return this.patients;
  }
  const search = this.editingRendezVous.nomPatient.toLowerCase();
  if (!search) return this.patients; 
  return this.patients.filter(p =>
    (`${p.nom} ${p.prenom}`).toLowerCase().includes(search)
  );
}

// Pour mettre à jour l'idDimPatient lors de la sélection
selectEditingPatient(p: any) {
  this.editingRendezVous!.idDimPatient = p.idDimPatient;
  this.editingRendezVous!.nomPatient = `${p.nom} ${p.prenom}`;
}



create(): void {
  this.newRendezVous.idDimPatient = this.newRendezVous.selectedPatientId;
  console.log('ID patient sélectionné :', this.newRendezVous.selectedPatientId);
  console.log('Payload complet :', this.newRendezVous);
  const lastId = Math.max(...this.rendezVousList.map(r => r.id), 0);
  this.newRendezVous.id = lastId + 1;

  console.log('ID généré pour le RDV :', this.newRendezVous.id);


  if (!this.newRendezVous.selectedPatientId) {
    alert('Veuillez sélectionner un patient');
    return;
  }

  const payload = {
    id: this.newRendezVous.id, 
    idDimPatient: this.newRendezVous.selectedPatientId,
    idDimActe: this.newRendezVous.idDimActe || 0,
    idDimConfirmationRendezVous: this.newRendezVous.idDimConfirmationRendezVous || 0,
    idDimDevis: this.newRendezVous.idDimDevis || 0,
    datePrevisionnelle: this.newRendezVous.datePrevisionnelle || '',
    heurePrevisionnelle: this.newRendezVous.heurePrevisionnelle || '',
    commentaires: this.newRendezVous.commentaires || ''
  };

  this.http.post(this.baseUrl, payload).subscribe({
    next: (res) => {
      this.getAll();
      this.newRendezVous = this.initForm();
      this.addSuccess = true;
      this.showAutoHidePopup('Rendez-vous ajouté avec succès.', 2500);
      setTimeout(() => { this.addSuccess = false; }, 3000);
    },
    error: (err: any) => {
      console.error('Erreur création RDV', err);
      let msg =
        (err && err.error && err.error.message) ? err.error.message :
        (err && err.message) ? err.message :
        'Voir logs serveur';
      alert('Échec création RDV : ' + msg);
    }
  });
}



  edit(rdv: RendezVousNonConfirmes): void {
    this.editingRendezVous = { ...rdv };
    this.editingRendezVousId = rdv.idFactPriseRendezVous || null;
  }

 update(): void {
  if (!this.editingRendezVous) { return; }

  // 1) ID à utiliser pour le PUT
  var idForUpdate: number;
  if (this.editingRendezVous.idFactPriseRendezVous !== undefined && this.editingRendezVous.idFactPriseRendezVous !== null) {
    idForUpdate = this.editingRendezVous.idFactPriseRendezVous;
  } else {
    idForUpdate = this.editingRendezVous.id; // fallback si besoin
  }

  // 2) Normaliser heure -> HH:mm:ss si tu en as besoin côté backend
  var heure = this.editingRendezVous.heurePrevisionnelle || '';
  if (heure && heure.length === 5) { // "HH:mm"
    heure = heure + ':00';
  }

  // 3) Payload (éviter undefined)
  var payload: any = {
    idFactPriseRendezVous: idForUpdate,
    id: (typeof this.editingRendezVous.id === 'number') ? this.editingRendezVous.id : idForUpdate,
    idDimPatient: (typeof this.editingRendezVous.idDimPatient === 'number') ? this.editingRendezVous.idDimPatient : 0,
    idDimActe: (typeof this.editingRendezVous.idDimActe === 'number') ? this.editingRendezVous.idDimActe : 0,
    idDimConfirmationRendezVous: (typeof this.editingRendezVous.idDimConfirmationRendezVous === 'number') ? this.editingRendezVous.idDimConfirmationRendezVous : 0,
    idDimDevis: (typeof this.editingRendezVous.idDimDevis === 'number') ? this.editingRendezVous.idDimDevis : 0,
    datePrevisionnelle: this.editingRendezVous.datePrevisionnelle || '',
    heurePrevisionnelle: heure,
    commentaires: this.editingRendezVous.commentaires || ''
  };

  this.http.put(this.baseUrl + '/' + idForUpdate, payload).subscribe(
    (res) => {
      this.getAll();
      this.editingRendezVous = null;
      this.editingRendezVousId = null;
      this.saveSuccess = true;
      this.showAutoHidePopup('Modification enregistrée.', 2500);
      var self = this;
      setTimeout(function(){ self.saveSuccess = false; }, 3000);
    },
    (err: any) => {
      var msg =
        (err && err.error && typeof err.error === 'object' && err.error.message) ? err.error.message :
        (err && err.error && typeof err.error === 'string') ? err.error :
        (err && err.message) ? err.message :
        'Voir logs serveur';
      alert('Échec modification RDV : ' + msg);
      console.error('Update failed', err);
    }
  );
}

// ==================== Annulation d'édition ====================
cancelEdit(): void {
  // Si aucun RDV en édition → rien à faire
  if (!this.editingRendezVousId) return;

  // Réinitialiser le RDV en édition et l’ID
  this.editingRendezVous = null;
  this.editingRendezVousId = null;

  // Recharger la liste depuis le serveur pour être sûr d’avoir les données originales
  this.getAll();

  // (optionnel) message visuel ou console
  console.log('Édition annulée : les modifications ont été ignorées');
}



 // Ferme la confirmation
cancelDelete(): void {
  this.showDeleteConfirm = false;
  this.selectedId = null;
}

// Supprime après confirmation
deleteRendezVous(): void {
  if (this.selectedId == null) { return; }
  this.delete(this.selectedId);
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
  const tentatives = this.rappel.tentatives || 0;
  const motifRappel = this.rappel.motifRappel || '';
  const motifRetour = this.rappel.motifRetour || '';

  // Construire le champ "motif"
  let motif = motifRappel;
  if (motifRappel === 'telephone' && motifRetour.length > 0) {
    motif = 'telephone:' + motifRetour;
  }

  // --- Envoi par mail si motif = 'mail' ---
  if (motifRappel === 'mail' && (this.rappel as any).email) {
    this.http.post(`http://localhost:8081/api/mail/send`, {
      to: (this.rappel as any).email,
      subject: 'Rappel RDV #' + this.rappel.idRdv,
      body: 'Bonjour, ceci est un rappel pour votre rendez-vous (Patient #' + this.rappel.idPatient + ').'
    }).subscribe({
      next: function() { console.log('Mail envoyé au patient'); },
      error: function(err) { console.error('Erreur envoi mail', err); }
    });
  }

  // --- Sauvegarde du rappel ---
  const payload: any = {
    idPatient: Number(this.rappel.idPatient),
    idRdv: Number(this.rappel.idRdv),
    motif: motif,
    nombreTentatives: tentatives
  };

  this.http.post(this.rappelUrl, payload).subscribe({
    next: (res: any) => {
      let retourId: any = null;
      if (res) {
        if (res.idRappelPatient !== undefined && res.idRappelPatient !== null) {
          retourId = res.idRappelPatient;
        } else if (res.id !== undefined && res.id !== null) {
          retourId = res.id;
        }
      }
      alert('Rappel enregistré avec succès' + (retourId !== null ? ' (id=' + retourId + ')' : '') + '.');
      this.rappel.tentatives = tentatives;
    },
    error: (err: any) => {
      console.error('Erreur création rappel', err);
      let messageErreur = 'Échec enregistrement rappel';
      if (err && err.error) {
        if (typeof err.error === 'string' && err.error.length > 0) {
          messageErreur += ' : ' + err.error;
        } else if (err.error.message) {
          messageErreur += ' : ' + err.error.message;
        }
      }
      alert(messageErreur);
    }
  });
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
    this.calculerStats();
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

  getRdvId(r: RendezVousNonConfirmes): number {
  if (!r) { return 0; }
  return (r.idFactPriseRendezVous !== undefined && r.idFactPriseRendezVous !== null)
    ? r.idFactPriseRendezVous
    : r.id;
}

// Ouvre la confirmation (depuis le template)
confirmDelete(idOrRdv: number | RendezVousNonConfirmes, $event?: Event): void {
  if ($event) { $event.stopPropagation(); }
  let id: number;
  if (typeof idOrRdv === 'number') {
    id = idOrRdv;
  } else {
    id = this.getRdvId(idOrRdv);
  }
  if (!id) { return; }
  this.showPopup(
    'Voulez-vous vraiment supprimer ce rendez-vous ?',
    'warning',       // type warning → deux boutons (Annuler/Confirmer)
    () => this.delete(id)  // action à exécuter si l'utilisateur confirme
  );
}

// Appel API réel
private delete(id: number): void {
  if (!id) { return; }
  this.http.delete(`${this.baseUrl}/${id}`).subscribe({
    next: () => {
      this.getAll();
      this.deleteSuccess = true;
      this.showPopup('Rendez-vous supprimé avec succès.', 'danger');
      setTimeout(() => this.deleteSuccess = false, 2500);
    },
    error: (err) => {
      console.error('Delete failed', err);
     const msg =
  (err && err.error && typeof err.error === 'object' && err.error.message) ? err.error.message :
  (err && typeof err.error === 'string') ? err.error :
  (err && err.message) ? err.message :
  'Voir logs serveur';

alert('Échec suppression RDV : ' + msg);

    }
  });
}

  onCardClick(r: RendezVousNonConfirmes): void {
  if (!r) return;

  const rdvId = this.getRdvId(r);

  //  Si la carte cliquée est déjà sélectionnée → la désélectionner
  if (this.selectedCardId === rdvId) {
    this.selectedCardId = null;
    this.rappel = {
      idRdv: null,
      idPatient: null,
      motifRappel: 'telephone',
      motifRetour: '',   // ← ajouté ici
      tentatives: 0
    };
    return;
  }

  //  Sinon → sélectionner la carte et remplir le formulaire
  this.selectedCardId = rdvId;
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
  totalRendezVous: number = 0;
upcomingRendezVous: number = 0;


calculerStats() {
  if (!this.rendezVousList) return;

  // ✅ Total des rendez-vous fixes (tous les RDV)
  this.totalRendezVous = this.rendezVousList.length;

  // Rendez-vous de la semaine (calculé uniquement à partir de la liste complète)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  this.upcomingRendezVous = this.rendezVousList.filter(rdv => {
    const rdvDate = new Date(rdv.datePrevisionnelle);
    return rdvDate >= today && rdvDate <= nextWeek;
  }).length;
}



// Affiche uniquement les RDV non confirmés de la semaine
showWeekNonConfirmed() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // ignorer l'heure

  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  weekEnd.setHours(23, 59, 59, 999);

  this.filteredRendezVous = this.rendezVousList.filter(rdv => {
    if (!rdv.datePrevisionnelle) return false;

    const parts = rdv.datePrevisionnelle.split('-'); // YYYY-MM-DD
    const rdvDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

    return rdvDate >= today && rdvDate <= weekEnd;
  });

  this.upcomingRendezVous = this.filteredRendezVous.length;
}


selectedWeek: any = null;
resetWeekRendezVous() {
  this.selectedWeek = null;  // ou la variable que tu utilises pour filtrer la semaine
  this.applyFilters();       // rafraîchit la liste des rendez-vous
}
selectedRappel: any = null;
showRappelModal: boolean = false;
hasRappel: boolean = false;


openHistoriquePopup(patientId: number) {
  console.log('openHistoriquePopup patientId=', patientId);

  this.http.get<any[]>(`http://localhost:8081/api/rappels_patients/patient/${patientId}`)
    .subscribe({
      next: (rappels) => {
        if (!rappels || rappels.length === 0) {
          console.log('Aucun rappel pour patient', patientId);
          this.selectedRappel = null;
          this.hasRappel = false;   // ← pas de rappel
          this.showRappelModal = true;
          return;
        }

        // S’il y a des rappels
        const last = rappels[rappels.length - 1];

        const raw = (last.motif !== undefined && last.motif !== null)
          ? String(last.motif)
          : ((last.motifRappel !== undefined) ? String(last.motifRappel) : '');

        let motifRappel = '';
        let motifRetour = '';

        if (raw) {
          const idx = raw.indexOf(':');
          if (idx >= 0) {
            motifRappel = raw.substring(0, idx);
            motifRetour = raw.substring(idx + 1);
          } else {
            motifRappel = raw;
            motifRetour = '';
          }
        }

        last.motifRappel = motifRappel;
        last.motifRetour = motifRetour;

        this.selectedRappel = last;
        this.hasRappel = true;   // ← il y a un rappel
        this.showRappelModal = true;
      },
      error: (err) => {
        console.error('Erreur openHistoriquePopup', err);
        this.selectedRappel = null;
        this.hasRappel = false;   // ← en cas d’erreur, on n’a pas de rappel
        this.showRappelModal = true;
      }
    });
}




closeRappelModal() {
  this.showRappelModal = false; // ← cache le modal
  this.selectedRappel = null;
}
// ===== POPUP SIMPLE  =====
popupVisible = false;
popupMessage = '';
popupType: 'success' | 'warning' | 'danger' = 'success';
popupConfirmAction: (() => void) | null = null;

// Affiche le popup. Si type === 'warning' et confirmAction fourni, on affichera deux boutons (Annuler/Confirmer)
showPopup(message: string, type: 'success' | 'warning' | 'danger' = 'success', confirmAction?: () => void): void {
  this.popupMessage = message;
  this.popupType = type;
  this.popupConfirmAction = confirmAction || null;
  this.popupVisible = true;
}

// Fermer le popup. Si confirm === true, exécute confirmAction (utile pour la suppression)
closePopup(confirm: boolean = false): void {
  if (confirm && this.popupConfirmAction) {
    // stocker l'action et la nettoyer pour éviter double exécution
    const action = this.popupConfirmAction;
    this.popupConfirmAction = null;
    action();
  } else {
    // nettoyer callback si on annule
    this.popupConfirmAction = null;
  }
  this.popupVisible = false;
}

// Optionnel : auto-hide pour les success (utilisable si tu veux)
showAutoHidePopup(message: string, delayMs: number = 2500) {
  this.showPopup(message, 'success');
  setTimeout(() => { this.popupVisible = false; }, delayMs);
}


private rdvCore(rdv: RendezVousNonConfirmes){
  return {
    id: this.getRdvId(rdv),
    idPatient: rdv.idDimPatient,
    date: rdv.datePrevisionnelle || '',
    heure: rdv.heurePrevisionnelle || '',
    commentaires: rdv.commentaires || ''
  };
}



sendingConfirmIds: Set<number> = new Set<number>();


sendConfirmationEmail(rdv: RendezVousNonConfirmes): void {
  const id = rdv.idFactPriseRendezVous != null ? rdv.idFactPriseRendezVous : rdv.id;
  if (!id) {
    alert('ID rendez-vous introuvable.');
    return;
  }

  this.http.post('http://localhost:8081/api/rendezvous-non-confirme/' + id + '/email-confirmation', {})
    .subscribe({
      next: (res: any) => {
        const destinataire = (res && res.to) ? ('à ' + res.to) : '';
        this.showAutoHidePopup('Email de confirmation envoyé ' + destinataire + '.', 2500);
      },
      error: (err) => {
        const msg =
          (err && err.error && typeof err.error === 'string') ? err.error :
          (err && err.error && err.error.message) ? err.error.message :
          (err && err.message) ? err.message : 'Erreur inconnue';
        alert('Échec envoi email : ' + msg);
      }
    });
}



}
