import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmationRendezVousComponent } from './ConfirmationRendezVous.component';

const routes: Routes = [
  {
    path: '',
    component: ConfirmationRendezVousComponent,
   
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfirmationRendezVousRoutingModule {}
