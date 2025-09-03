import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ConfirmationRendezVous {
  id_dim_confirmation_rendez_vous: number;
  id: number;
  id_acte: number;
  id_personnel: number;
  id_fauteuil: number;
  date_rdv_confirme: string;
  heure_rdv_confirme: string;
  date_arrivee_patient: string;
  heure_arrivee_patient: string;
  rdv_duree: number;
  heure_salle_attente: string;
  heure_sortie: string;
}

@Component({
  selector: 'app-confirmation-rendez-vous',
  templateUrl: './confirmation-rendez-vous.component.html',
  styleUrls: ['./confirmation-rendez-vous.component.scss']
})
export class ConfirmationRendezVousComponent implements OnInit {
  data: ConfirmationRendezVous[] = [];
  loading = false;
  error: string | null = null;

  // ⚠️ adapte l’URL selon ton backend
  private readonly apiUrl = 'http://localhost:8081/api/rendezvous';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.http.get<ConfirmationRendezVous[]>(this.apiUrl).subscribe({
      next: (rows) => {
        this.data = rows ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement.';
        console.error(err);
        this.loading = false;
      }
    });
  }
}