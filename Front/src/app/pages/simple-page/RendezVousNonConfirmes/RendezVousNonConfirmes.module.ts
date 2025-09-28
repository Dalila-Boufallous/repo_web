import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { RendezVousNonConfirmesRoutingModule } from './RendezVousNonConfirmes-routing.module';
import { RendezVousNonConfirmesComponent } from './RendezVousNonConfirmes.component';

@NgModule({
  declarations: [
    RendezVousNonConfirmesComponent
  ],
  imports: [
    
    CommonModule,
    FormsModule,
    HttpClientModule,
    RendezVousNonConfirmesRoutingModule
  ]
})
export class RendezVousNonConfirmesModule { }
