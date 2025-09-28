import { NgModule } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  


import { PersonnelRoutingModule } from './Personnel-routing.module';
import { PersonnelComponent } from './Personnel.component';



@NgModule({
  declarations: [PersonnelComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    PersonnelRoutingModule
  ]
})
export class PersonnelModule { }
