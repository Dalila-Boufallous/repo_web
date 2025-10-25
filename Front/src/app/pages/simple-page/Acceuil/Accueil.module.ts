import { NgModule } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  


import { AccueilRoutingModule } from './Accueil-routing.module';
import { AccueilComponent } from './Accueil.component';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core'; 

registerLocaleData(localeFr);
@NgModule({
  declarations: [AccueilComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    AccueilRoutingModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }

  ]
})
export class AccueilModule { }
