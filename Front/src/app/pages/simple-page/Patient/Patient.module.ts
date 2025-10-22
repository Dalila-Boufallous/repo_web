import { NgModule } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  
import { SharedModule } from '../../../shared/shared.module';

import { PatientRoutingModule } from './Patient-routing.module';
import { PatientComponent } from './Patient.component';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core'; 

registerLocaleData(localeFr);


@NgModule({
  declarations: [PatientComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    PatientRoutingModule,
    SharedModule,
    
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }

  ]
})
export class PatientModule { }
