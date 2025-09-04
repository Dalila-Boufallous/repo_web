import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ConfirmationRendezVousComponent} from './ConfirmationRendezVous.component';

const routes: Routes = [
  {
    path: '',
    component: ConfirmationRendezVousComponent,
    data: {
      breadcrumb: 'Default',
      icon: 'icofont-home bg-c-blue',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfirmationRendezVousRoutingModule { }
