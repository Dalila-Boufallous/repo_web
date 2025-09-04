import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SimplePageRoutingModule } from './simple-page-routing.module';
import { SimplePageComponent } from './simple-page.component';
import {SharedModule} from '../../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    SimplePageRoutingModule,
    SharedModule,
     HttpClientModule
  ],
  declarations: [SimplePageComponent]
})
export class SimplePageModule { }
