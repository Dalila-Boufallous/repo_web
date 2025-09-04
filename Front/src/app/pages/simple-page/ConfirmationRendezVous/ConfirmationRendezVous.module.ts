import { NgModule } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // ✅ pour les formulaires
import { SharedModule } from '../../../shared/shared.module';
import { ConfirmationRendezVousRoutingModule } from './ConfirmationRendezVous-routing.module'; // ✅ routing séparé

import { ConfirmationRendezVousComponent } from './ConfirmationRendezVous.component';

@NgModule({
  declarations: [
    ConfirmationRendezVousComponent  // ✅ déclarer uniquement ici
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,            // ✅ support pour ngModel
    ReactiveFormsModule,    // ✅ support pour les formulaires réactifs
    SharedModule,
    ConfirmationRendezVousRoutingModule // ✅ routing importé
  ]
})
export class ConfirmationRendezVousModule {}
