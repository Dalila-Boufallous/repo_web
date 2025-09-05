import { NgModule } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  
import { SharedModule } from '../../../shared/shared.module';
import { ConfirmationRendezVousRoutingModule } from './ConfirmationRendezVous-routing.module'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ConfirmationRendezVousComponent } from './ConfirmationRendezVous.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCalendar } from '@angular/material/datepicker';

@NgModule({
  declarations: [
    ConfirmationRendezVousComponent  
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,            
    ReactiveFormsModule,    
    SharedModule,
    ConfirmationRendezVousRoutingModule ,
  ]
})
export class ConfirmationRendezVousModule {}
