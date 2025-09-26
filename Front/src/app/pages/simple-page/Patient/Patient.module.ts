import { NgModule } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  
import { SharedModule } from '../../../shared/shared.module';

import { PatientRoutingModule } from './Patient-routing.module';
import { PatientComponent } from './Patient.component';



@NgModule({
  declarations: [PatientComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    PatientRoutingModule,
    SharedModule,
  ]
})
export class PatientModule { }
