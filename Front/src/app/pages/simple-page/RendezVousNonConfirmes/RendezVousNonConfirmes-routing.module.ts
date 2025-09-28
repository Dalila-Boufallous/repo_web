import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RendezVousNonConfirmesComponent } from './RendezVousNonConfirmes.component';

const routes: Routes = [
  { path: '', component: RendezVousNonConfirmesComponent } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RendezVousNonConfirmesRoutingModule { }
