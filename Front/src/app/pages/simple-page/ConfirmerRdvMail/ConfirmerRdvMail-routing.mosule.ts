import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-confirm-rdv',
  templateUrl: './confirm-rdv.component.html',
})
export class ConfirmRdvComponent implements OnInit {
  message = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.http.post<{ success: boolean; msg: string }>(
        'http://localhost:8081/api/rendezvous-non-confirme',
        { token }
      ).subscribe({
        next: res => this.message = res.msg,
        error: () => this.message = 'Erreur lors de la confirmation du rendez-vous.'
      });
    } else {
      this.message = 'Token manquant.';
    }
  }
}
