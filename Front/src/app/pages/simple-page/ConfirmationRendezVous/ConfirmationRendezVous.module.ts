import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {SharedModule} from '../../../shared/shared.module';

import { ConfirmationRendezVousComponent } from './ConfirmationRendezVous.component';

const routes: Routes = [
  { path: '', component: ConfirmationRendezVousComponent } // /bootstrap-table
];

@NgModule({
  declarations: [ConfirmationRendezVousComponent], // ✅ déclaré ici (et ici uniquement)
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class ConfirmationRendezVousModule {}
