import { NgModule } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  


import { PersonnelRoutingModule } from './Personnel-routing.module';
import { PersonnelComponent } from './Personnel.component';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core'; 

registerLocaleData(localeFr);
@NgModule({
  declarations: [PersonnelComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    PersonnelRoutingModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }

  ]
})
export class PersonnelModule { }
