import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';


export interface Patient {
  idDimPatient?: number;
  idPersonne?: number;
  nom?: string ;
  prenom?: string;
  genre?: string;
  dateNaissance?: string;
  dateCreation?: string;
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
  newPatient: Patient = {
  idPersonne: null,
  nom: '',
  prenom: '',
  genre: '',
  dateNaissance: '',
  dateCreation: '',
  statutMarital: '',
  couvertureSociale: ''
};
  editedPatient: Patient = {};
  editingPatientId: number | null = null;
  searchPatient: string = '';

  // Messages
  addSuccess = false;
  saveSuccess = false;
  deleteSuccess = false;

  // Popup suppression
  showDeleteConfirm = false;
  selectedDeleteId: number | null = null;

  private baseUrl = 'http://localhost:8081/api/patients';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.http.get<Patient[]>(this.baseUrl).subscribe(data => this.patients = data);
  }

  // Ajouter ou sauver patient
  // Ajouter cette méthode dans PatientComponent
saveEditedPatient(patient: Patient): void {
  // Copier les valeurs éditées
  const updatedPatient = { ...patient, ...this.editedPatient };

  this.http.put<Patient>(`${this.baseUrl}/${patient.idDimPatient}`, updatedPatient)
    .subscribe({
      next: data => {
        // Mettre à jour la liste localement
        const index = this.patients.findIndex(p => p.idDimPatient === patient.idDimPatient);
        if (index !== -1) this.patients[index] = data;

        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 2000);

        this.cancelEdit();
      },
      error: err => console.error('Erreur mise à jour patient', err)
    });
}



  // Commencer l’édition
  startEdit(patient: Patient): void {
    this.editingPatientId = patient.idDimPatient!;
    this.editedPatient = { ...patient };
  }

  cancelEdit(): void {
    this.editingPatientId = null;
    this.editedPatient = {};
  }

  // Pop-up suppression
  confirmDelete(id: number): void {
    this.selectedDeleteId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.selectedDeleteId = null;
  }

  deletePatient(): void {
    if (this.selectedDeleteId === null) return;
    this.http.delete(`${this.baseUrl}/${this.selectedDeleteId}`).subscribe(() => {
      this.loadPatients();
      this.showDeleteConfirm = false;
      this.deleteSuccess = true;
      setTimeout(() => this.deleteSuccess = false, 2000);
      this.selectedDeleteId = null;
    });
  }
  get filteredPatients() {
  return this.patients.filter(p =>
    p.nom.toLowerCase().includes((this.searchPatient || '').toLowerCase()) ||
    p.prenom.toLowerCase().includes((this.searchPatient || '').toLowerCase())
  );
}
// Ajouter un nouveau patient
addPatient(): void {
  // Crée une copie pour éviter les références directes
  const patientToAdd: Patient = { ...this.newPatient };

  this.http.post<Patient>(this.baseUrl, patientToAdd)
    .subscribe({
      next: data => {
        // Actualiser la liste des patients
        this.loadPatients();

        // Message succès
        this.addSuccess = true;
        setTimeout(() => this.addSuccess = false, 2000);

        // Réinitialiser le formulaire
        this.newPatient = {
          idPersonne: null,
          nom: '',
          prenom: '',
          genre: '',
          dateNaissance: '',
          dateCreation: '',
          statutMarital: '',
          couvertureSociale: ''
        };
      },
      error: err => console.error('Erreur ajout patient', err)
    });
}


}
