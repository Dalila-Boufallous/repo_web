import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ConfirmationRendezVousDto {
  idDimConfirmationRendezVous: number;
  id: number;
  idActe: number;
  idPersonnel: number;
  idFauteuil: number;
  dateRdvConfirme: string;
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
  data: ConfirmationRendezVousDto[] = [];
  loading = false;
  error: string | null = null;

  private readonly apiUrl = 'http://localhost:8081/api/rendezvous';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.error = null;

    this.http.get<ConfirmationRendezVousDto[]>(this.apiUrl).subscribe(
      (rows) => {
        this.data = rows || [];   // compatible TS ancien
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement.';
        this.loading = false;
      }
    );
  }
}

