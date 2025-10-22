import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

export interface Patient {
  idDimPatient?: number | null;
  idPersonne?: number | null;
  nom?: string;
  prenom?: string;
  genre?: string;
  age?: number | null;
  dateNaissance?: string;    
  dateCreation?: string;     
  assistanteResp?: number | null;
  praticienResp?: number | null;
  region?: string;
  statutMarital?: string;
  couvertureSociale?: string;
}

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit {
  patients: Patient[] = [];

  // ➜ ID ciblé depuis /patients?patientId=XXX
  selectedPatientId: number | null = null;

  // Formulaire d’ajout
  newPatient: Patient = {
    idPersonne: null,
    nom: '',
    prenom: '',
    genre: '',
    age: null,
    dateNaissance: '',
    dateCreation: '',
    assistanteResp: null,
    praticienResp: null,
    region: '',
    statutMarital: '',
    couvertureSociale: ''
  };

  // Edition
  editedPatient: Patient = {};
  editingPatientId: number | null = null;

  // Recherche texte
  searchPatient: string = '';

  // Messages
  addSuccess = false;
  saveSuccess = false;
  deleteSuccess = false;

  // Popup suppression
  showDeleteConfirm = false;
  selectedDeleteId: number | null = null;

  // UI divers
  searchWidth = 300; // largeur fixe en pixels

  private baseUrl = 'http://localhost:8081/api/patients';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) Écoute des query params (patientId)
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('patientId');
      this.selectedPatientId = id ? +id : null;
    });

    // 2) Chargement de la liste
    this.loadPatients();
  }

  // ------- CRUD -------
  loadPatients(): void {
    this.http.get<Patient[]>(this.baseUrl).subscribe(data => {
      this.patients = Array.isArray(data) ? data : [];
    });
  }

  saveEditedPatient(patient: Patient): void {
    const updatedPatient = { ...patient, ...this.editedPatient };
    this.http.put<Patient>(`${this.baseUrl}/${patient.idDimPatient}`, updatedPatient)
      .subscribe({
        next: data => {
          const index = this.patients.findIndex(p => p.idDimPatient === patient.idDimPatient);
          if (index !== -1) this.patients[index] = data;

          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 2000);

          this.cancelEdit();
        },
        error: err => console.error('Erreur mise à jour patient', err)
      });
  }

 startEdit(patient: Patient): void {
  
  this.editingPatientId = (patient.idDimPatient != null) ? patient.idDimPatient : null;

  this.editedPatient = { ...patient };
}


  cancelEdit(): void {
    this.editingPatientId = null;
    this.editedPatient = {};
  }

  confirmDelete(id: number | null | undefined): void {
    if (id == null) return;
    this.selectedDeleteId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.selectedDeleteId = null;
  }

  deletePatient(): void {
    if (this.selectedDeleteId === null) return;
    this.http.delete(`${this.baseUrl}/${this.selectedDeleteId}`).subscribe({
      next: () => {
        this.loadPatients();
        this.showDeleteConfirm = false;
        this.deleteSuccess = true;
        setTimeout(() => this.deleteSuccess = false, 2000);
        this.selectedDeleteId = null;
      },
      error: err => console.error('Erreur suppression patient', err)
    });
  }

 addPatient(): void {
  // Génère un idPersonne aléatoire avant l'ajout
  const patientToAdd: Patient = { 
    ...this.newPatient,
    idPersonne: Math.floor(Math.random() * 10000)
  };

  this.http.post<Patient>(this.baseUrl, patientToAdd)
    .subscribe({
      next: () => {
        // Recharge la liste des patients
        this.loadPatients();

        // Message de succès
        this.addSuccess = true;
        setTimeout(() => this.addSuccess = false, 2000);

        // Réinitialise le formulaire
        this.newPatient = {
          idPersonne: null,
          nom: '',
          prenom: '',
          genre: '',
          age: null,
          dateNaissance: '',
          dateCreation: '',
          assistanteResp: null,
          praticienResp: null,
          region: '',
          statutMarital: '',
          couvertureSociale: ''
        };
      },
      error: err => console.error('Erreur ajout patient', err)
    });
}

get dateNaissanceFr(): string {
  return this.formatDateFr(this.newPatient.dateNaissance);
}

set dateNaissanceFr(value: string) {
  // Convertit de "12 févr. 2025" en "2025-02-12" pour l'enregistrement
  const parts = value.split(/[\s.]+/); // simplifié
  if (parts.length === 3) {
    const day = parts[0];
    const month = this.getMonthNumber(parts[1]);
    const year = parts[2];
    this.newPatient.dateNaissance = `${year}-${month}-${day}`;
  }
}
getMonthNumber(abbrev: string): string {
  const months: any = {
    janv: '01', fév: '02', mars: '03', avr: '04',
    mai: '05', juin: '06', juil: '07', août: '08',
    sept: '09', oct: '10', nov: '11', déc: '12'
  };
  return months[abbrev.toLowerCase()] || '01';
}

  // ------- Filtrage / Recherche -------
  /**
   * Enlève le filtre de patient ciblé et nettoie l’URL
   */
  clearPatientFilter(): void {
    this.selectedPatientId = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { patientId: null },
      queryParamsHandling: 'merge'
    });
  }
  formatDateFr(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  // Options pour afficher abrégé les mois en français
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}


  /**
   * Liste affichée = (patients filtrés par ID ciblé) + recherche texte
   */
  get filteredPatients(): Patient[] {
  let base = this.patients;
  
  // Filtre par patient sélectionné si besoin
  if (this.selectedPatientId != null) {
    base = base.filter(p => p.idPersonne === this.selectedPatientId);
  }

  const term = (this.searchPatient || '').toLowerCase().trim();
  if (!term) return base;

  return base.filter(patient => {
    const formatDateFr = (dateStr?: string): string => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr; // si pas une date valide, retourne original
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    };
    // On transforme chaque champ en string pour éviter erreurs
    const valuesToCheck = [
      patient.nom || '',
      patient.prenom || '',
      patient.genre || '',
      patient.age != null ? patient.age.toString() : '',
      formatDateFr(patient.dateNaissance),
      formatDateFr(patient.dateCreation),
      patient.region || '',
      patient.statutMarital || '',
      patient.couvertureSociale || ''
    ];

    return valuesToCheck.some(v => v.toLowerCase().includes(term));
  });
}



getTodayPatientsCount(): number {
  const today = new Date();
  // On récupère seulement la date sans l'heure
  const todayStr = today.toISOString().split('T')[0]; // yyyy-MM-dd

  return this.patients.filter(p => {
    if (!p.dateCreation) return false;
    // On ne prend que la partie date
    const creationDate = p.dateCreation.split('T')[0];
    return creationDate === todayStr;
  }).length;
}

}
