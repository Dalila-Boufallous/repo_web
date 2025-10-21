import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { NgForm } from '@angular/forms';


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
  idActe: number ;
  idPersonnel: number;
  idFauteuil: string;
  dateRdvConfirme: string;
  heureRdvConfirme: string;
  dateArriveePatient: string;
  heureArriveePatient: string;
  rdvDuree: number;
  heureSalleAttente: string;
  heureSortie: string;
  reminderCount?: number;
  nomPatient?: string; 
  personnelNom?: string;
  acteLibelle?: string;
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

  newRdv: Partial<ConfirmationRendezVous> = {
  idPatient: null,
  idPersonnel: null,
  idActe: null,
  idFauteuil: '',
  dateRdvConfirme: '',
  heureRdvConfirme: ''
};


  addSuccess = false;

  selectedDate = '';
  private apiUrl = 'http://localhost:8081/api/rendezvous';
  actesList: string[] = [];
  personnelsList: Utilisateur[] = [];
  searchRdv = '';
  actes: any[] = [];
  patients: any[] = [];
  startDate: string = '';
  endDate: string = '';


  private sendingMap: Record<number, boolean> = {};

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.initCalendar();
    this.calculateWeeklyRendezVous();
    this.loadActes();
    this.loadPatients();
    this.loadPersonnels();
    this.getRendezVous();
   
    
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
          this.rendezVousList.forEach(rdv => {
          rdv.heureRdvConfirme = this.formatTimeHHMM(rdv.heureRdvConfirme);
          rdv.heureArriveePatient = this.formatTimeHHMM(rdv.heureArriveePatient);
          rdv.heureSalleAttente = this.formatTimeHHMM(rdv.heureSalleAttente);
          rdv.heureSortie = this.formatTimeHHMM(rdv.heureSortie);
           });
           
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
updatePatientId() {
  if (!this.editedRendezVous.nomPatient) return;
  const patient = this.patients.find(p => `${p.nom} ${p.prenom}` === this.editedRendezVous.nomPatient);
  this.editedRendezVous.idPatient = patient ? patient.idPersonne : null;
}

updatePersonnelId() {
  if (!this.editedRendezVous.personnelNom) return;
  const personnel = this.personnelsList.find(p => `${p.nom} ${p.prenom}` === this.editedRendezVous.personnelNom);
  this.editedRendezVous.idPersonnel = personnel ? personnel.idUtilisateur : null;
}

updateActeId() {
  if (!this.editedRendezVous.acteLibelle) return;
  const acte = this.actes.find(a => a.acteLibelle === this.editedRendezVous.acteLibelle);
  this.editedRendezVous.idActe = acte ? acte.idActe : null;
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
    this.selectedPatientNomPrenom = this.getPatientNom(rdv.idPatient);
    this.editedRendezVous.heureArriveePatient = this.formatTimeHHMM(rdv.heureArriveePatient);
     // Copie complète des valeurs dans l'objet de formulaire
    this.editedRendezVous = {
    ...rdv,
    heureRdvConfirme: this.formatTimeHHMM(rdv.heureRdvConfirme),
    heureArriveePatient: this.formatTimeHHMM(rdv.heureArriveePatient),
    heureSalleAttente: this.formatTimeHHMM(rdv.heureSalleAttente),
    heureSortie: this.formatTimeHHMM(rdv.heureSortie)
  };

  // Pour les noms affichés si tu utilises select/input
  this.editedRendezVous.nomPatient = this.getPatientNom(rdv.idPatient);
  this.editedRendezVous.personnelNom = this.getPersonnelNom(rdv.idPersonnel);
  this.editedRendezVous.acteLibelle = this.getActeLibelle(rdv.idActe);

  }

  cancelEdit(): void {
    this.editRendezVousId = null;
    this.editedRendezVous = {};
  }
  getActeIdByLibelle(libelle: string): number | null {
  const acte = this.actes.find(a => a.acteLibelle === libelle);
  return acte ? acte.idActe : null;
}

resetAddForm(form?: NgForm) {
  this.newRdv = {
    idPatient: null,
    idPersonnel: null,
    idActe: null,
    idFauteuil: '',
    dateRdvConfirme: '',
    heureRdvConfirme: '',
    rdvDuree: null
  };
  if (form) form.resetForm(); 
}


saveRendezVous(rdv: ConfirmationRendezVous): void { 
  if (!rdv.idDimConfirmationRendezVous) return;

  // Mise à jour des IDs avant l'envoi
  this.updatePatientId();
  this.updatePersonnelId();
  this.updateActeId();

  // Vérification que tous les IDs sont bien définis
  if (!this.editedRendezVous.idPatient || !this.editedRendezVous.idPersonnel || !this.editedRendezVous.idActe) {
    this.errorMessage = 'Patient, personnel ou acte non défini.';
    return;
  }

  this.http.put<ConfirmationRendezVous>(`${this.apiUrl}/${rdv.idDimConfirmationRendezVous}`, this.editedRendezVous)
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
getIdPatient(nom: string, prenom: string): number | null {
  const patient = this.patients.find(
    p => p.nom.toLowerCase() === nom.toLowerCase() && p.prenom.toLowerCase() === prenom.toLowerCase()
  );
  return patient ? patient.idPatient : null;
}
selectedPatientNomPrenom: string = '';

// Lorsqu’un patient est sélectionné
onEditPatientChange(nomPrenom: string) {
  const patient = this.patients.find(p => `${p.nom} ${p.prenom}` === nomPrenom);
  if (patient) {
    this.newRdv.idPatient = Number(patient.idPersonne); // mettre à jour l’ID
    this.newRdv.nomPatient = `${patient.nom} ${patient.prenom}`; // pour affichage si nécessaire
  } else {
    this.newRdv.idPatient = null;
  }
}

private formatTimeHHMM(time?: string): string {
  return time ? time.slice(0,5) : '';
}


onPersonnelChange(nomPrenom: string) {
  const perso = this.personnelsList.find(p => `${p.nom} ${p.prenom}` === nomPrenom);
  if (!perso) return;

  const id = Number(perso.idUtilisateur);
  if (this.editRendezVousId) {
    this.editedRendezVous.idPersonnel = id;
    this.editedRendezVous.personnelNom = `${perso.nom} ${perso.prenom}`;
  } else {
    this.newRdv.idPersonnel = id;
  }
}

onActeChange(libelle: string) {
  const acte = this.actes.find(a => a.acteLibelle === libelle);
  if (!acte) return;

  const id = Number(acte.idActe);
  if (this.editRendezVousId) {
    this.editedRendezVous.idActe = id;
    this.editedRendezVous.acteLibelle = acte.acteLibelle;
  } else {
    this.newRdv.idActe = id;
  }
}


personnels: any[] = [];
getIdPersonnel(nom: string, prenom: string): number | null {
  const personnel = this.personnels.find(
    p => p.nom.toLowerCase() === nom.toLowerCase() && p.prenom.toLowerCase() === prenom.toLowerCase()
  );
  return personnel ? personnel.idPersonnel : null;
}
  addRendezVous(): void {
  if (!this.newRdv.idPatient || !this.newRdv.idPersonnel || !this.newRdv.idActe || !this.newRdv.dateRdvConfirme) {
    this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
    return;
  }

  const payload = {
    id: Math.floor(Math.random() * 1000000000),
    idPatient: String(this.newRdv.idPatient),
    idPersonnel: String(this.newRdv.idPersonnel),
    idActe: String(this.newRdv.idActe),
    idFauteuil: this.newRdv.idFauteuil || null,
    dateRdvConfirme: this.newRdv.dateRdvConfirme,
    heureRdvConfirme: this.newRdv.heureRdvConfirme,
    rdvDuree: this.newRdv.rdvDuree || null,
    dateArriveePatient: this.newRdv.dateArriveePatient || null,
    heureArriveePatient: this.newRdv.heureArriveePatient || null,
    heureSalleAttente: this.newRdv.heureSalleAttente || null,
    heureSortie: this.newRdv.heureSortie || null
  };

  console.log('Payload RDV:', payload);

  this.http.post<ConfirmationRendezVous>(this.apiUrl, payload).subscribe({
    next: (addedRdv) => {
      
      this.rendezVousList.push(addedRdv);
      this.applyDateFilter();
      //this.resetAddForm({} as NgForm); // reset form
      this.addSuccess = true;
      setTimeout(() => this.addSuccess = false, 3000);
      

    },
    error: (err) => {
      console.error('Erreur ajout RDV:', err);
      this.errorMessage = 'Erreur lors de l’ajout du rendez-vous.';
    }
  });
}


private findOrCreatePatient(nom: string, prenom: string) {
  return this.http.get<any[]>(`http://localhost:8081/api/patients?nom=${nom}&prenom=${prenom}`)
    .pipe(
      switchMap(patients => {
        if (patients.length > 0) return of(patients[0].idDimPatient); // <-- ici
        const newPatient = { nom, prenom };
        return this.http.post<any>('http://localhost:8081/api/patients', newPatient)
          .pipe(map(created => created.idDimPatient)); // <-- ici
      }),
      catchError(err => {
        console.error('Erreur patient', err);
        return throwError(() => err);
      })
    );
}

private findOrCreatePersonnel(nom: string, prenom: string) {
  return this.http.get<any[]>(`http://localhost:8081/api/utilisateurs?nom=${nom}&prenom=${prenom}`)
    .pipe(
      switchMap(personnels => {
        if (personnels.length > 0) return of(personnels[0].idDimUtilisateur); 
        const newPerso = { nom, prenom };
        return this.http.post<any>('http://localhost:8081/api/utilisateurs', newPerso)
          .pipe(map(created => created.idDimUtilisateur)); 
      }),
      catchError(err => {
        console.error('Erreur personnel', err);
        return throwError(() => err);
      })
    );
}



private findOrCreateActe(libelle: string) {
  return this.http.get<any[]>(`http://localhost:8081/api/actes?libelle=${libelle}`)
    .pipe(
      switchMap(actes => {
        if (actes.length > 0) return of(actes[0].idActe);
        const newActe = { acteLibelle: libelle };
        return this.http.post<any>('http://localhost:8081/api/actes', newActe)
          .pipe(map(created => created.idActe));
      }),
      catchError(err => {
        console.error('Erreur acte', err);
        return throwError(() => err);
      })
    );
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
  return this.filteredRendezVousList.filter(rdv => {
    const matchRdv = this.searchIdRdv
      ? String(rdv.id).includes(this.searchIdRdv) ||
        (rdv.idDimConfirmationRendezVous != null && String(rdv.idDimConfirmationRendezVous).includes(this.searchIdRdv))
      : true;

    const matchPatient = this.searchIdPatient
      ? String(rdv.idPatient).includes(this.searchIdPatient)
      : true;

    return matchRdv && matchPatient;
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

emailSuccessMap: { [key: number]: boolean } = {};
emailErrorMap: { [key: number]: boolean } = {};

// Envoi Mail

sendEmailReminderFromRow(rdv: ConfirmationRendezVous) {

  this.emailSuccessMap[rdv.id] = false;
  this.emailErrorMap[rdv.id] = false;

  // --- Clé du RDV côté backend ---
  const idRdv = rdv.idDimConfirmationRendezVous != null ? rdv.idDimConfirmationRendezVous : rdv.id;
  if (!idRdv) {
    
    alert('RDV invalide : idDim manquant.');
    return;
  }

  // --- Récupérer le patient ---
  let patientId: number | null = rdv.idPatient != null ? rdv.idPatient : null;

  if (!patientId && rdv.nomPatient) {
    const found = this.patients.find(function(p) {
      const fullName = ((p.nom ? p.nom : '') + ' ' + (p.prenom ? p.prenom : '')).trim().toLowerCase();
      return fullName === rdv.nomPatient.trim().toLowerCase();
    });
    if (found) {
      patientId = found.idPersonne != null ? found.idPersonne : (found.idPatient != null ? found.idPatient : null);
    }
  }

  if (!patientId) {
    alert('Impossible d’envoyer le rappel : patient introuvable.');
    return;
  }

  // --- Vérifier que le patient a un email ---
  const patientObj = this.patients.find(function(p) {
    const idP = p.idPersonne != null ? p.idPersonne : (p.idPatient != null ? p.idPatient : null);
    return idP === patientId;
  });
  if (!patientObj || !patientObj.email) {
    alert('Impossible d’envoyer : le patient sélectionné n’a pas d’adresse email.');
    return;
  }

  // --- Appel HTTP ---
  this.http.post<{ status: string, messageId?: string, to?: string }>(
    this.apiUrl + '/' + idRdv + '/email-reminder',
    { patientId: patientId }
  ).subscribe({
    next: function(response) {
      if (response.status === 'sent') {
        
        alert('✅ Rappel envoyé à ' + (response.to ? response.to : rdv.nomPatient));
      } else {
        alert('❌ Échec de l’envoi du rappel.');
      }
    },
    error: function(err) {
      console.error('Erreur envoi email pour rdv', idRdv, err);
      alert('❌ Erreur serveur lors de l’envoi du rappel.');
    }
  });
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

 
  searchIdPatient: string = '';
  searchIdRdv: string = '';

// ---- Recherche par ID Patient ----
searchByIdPatient(idPatient: string | null): void {
  if (!idPatient) {
    this.filteredRendezVousList = [...this.rendezVousList];
    return;
  }

  const idNumber = Number(idPatient);

  this.filteredRendezVousList = this.rendezVousList.filter(rdv => 
    rdv.idPatient === idNumber
  );

  this.calculateWeeklyRendezVous();
}

  // ---- Recherche par ID Rendez-vous ----
searchByIdRdv(idRdv: number): void {
  if (!idRdv) {
    this.filteredRendezVousList = [...this.rendezVousList];
    return;
  }

  this.filteredRendezVousList = this.rendezVousList.filter(rdv => {
    const rdvKey = rdv.idDimConfirmationRendezVous != null ? rdv.idDimConfirmationRendezVous : rdv.id;
    return rdvKey === idRdv;
  });

  this.calculateWeeklyRendezVous();
}
actesMap: Map<number, string> = new Map();

loadActes() {
  this.http.get<any[]>('http://localhost:8081/api/actes')
    .subscribe(data => {
      this.actes = data;
      data.forEach(a => this.actesMap.set(a.idActe, a.acteLibelle));
    });
}

getActeLibelle(idActe: number): string { return this.actesMap.get(idActe) || 'Acte inconnu'; }
patientsMap: Map<number, string> = new Map();
loadPatients() {
  this.http.get<any[]>('http://localhost:8081/api/patients') 
    .subscribe({
      next: data => {
        console.log('Données reçues du backend:', data);
        this.patients = data;

        // Remplissage du map pour l'affichage
        this.patientsMap.clear();
        data.forEach(p => {
          this.patientsMap.set(Number(p.idPersonne), `${p.nom} ${p.prenom}`);
        });
      },
      error: err => console.error('Erreur chargement patients:', err)
    });
}

getPatientNom(idPatient: number | string): string {
  if (!idPatient) return 'Patient inconnu';
  const id = Number(idPatient);
  return this.patientsMap.get(id) || 'Patient inconnu';
}



applyDateRangeFilter(): void {
  if (!this.startDate && !this.endDate) {
    this.filteredRendezVousList = [...this.rendezVousList];
    return;
  }

  const start = this.startDate ? new Date(this.startDate) : null;
  const end = this.endDate ? new Date(this.endDate) : null;

  this.filteredRendezVousList = this.rendezVousList.filter(rdv => {
    const rdvDate = new Date(rdv.dateRdvConfirme);
    if (start && end) {
      return rdvDate >= start && rdvDate <= end;
    } else if (start) {
      return rdvDate >= start;
    } else if (end) {
      return rdvDate <= end;
    }
    return true;
  });

  this.calculateWeeklyRendezVous();
}
clearDateRange(): void {
  this.startDate = '';
  this.endDate = '';
  this.applyDateRangeFilter();
}

personnelsMap: Map<number, string> = new Map();

loadPersonnels() {
  this.http.get<Utilisateur[]>('http://localhost:8081/api/utilisateurs')
    .subscribe(data => {
      this.personnelsList = data;
      data.forEach(p => this.personnelsMap.set(p.idUtilisateur, `${p.nom} ${p.prenom}`));
      console.log('Personnels map:', this.personnelsMap);
    });
}

getPersonnelNom(idPersonnel: number | string): string {
  const id = Number(idPersonnel);
  return this.personnelsMap.get(id) || 'Personnel inconnu';
}

}
