import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmationRendezVousComponent } from './ConfirmationRendezVous.component';

const routes: Routes = [
  {
    path: '',
    component: ConfirmationRendezVousComponent,
    data: {
      breadcrumb: 'Confirmation RDV', // titre plus explicite
      icon: 'icofont-calendar bg-c-blue', // icône représentative
      status: true // true pour activer le menu si nécessaire
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfirmationRendezVousRoutingModule {}
