import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminComponent} from './layout/admin/admin.component';
import {AuthComponent} from './layout/auth/auth.component';
import { ConfirmationRendezVousComponent } from './pages/simple-page/ConfirmationRendezVous/ConfirmationRendezVous.component';
import { PersonnelComponent } from './pages/simple-page/Personnel/Personnel.component';


const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard-default/dashboard-default.module')
          .then(m => m.DashboardDefaultModule)
      },
      {
        path: 'basic',
        loadChildren: () => import('./pages/ui-elements/basic/basic.module')
          .then(m => m.BasicModule)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./pages/ui-elements/advance/notifications/notifications.module')
          .then(m => m.NotificationsModule)
      },
      {
        path: 'bootstrap-table',
        loadChildren: () => import('./pages/simple-page/ConfirmationRendezVous/ConfirmationRendezVous.module')
          .then(m => m.ConfirmationRendezVousModule) 
      },
      
      {
        path: 'map',
        loadChildren: () => import('./pages/map/google-map/google-map.module')
          .then(m => m.GoogleMapModule)
      },
      {
        path: 'user',
        loadChildren: () => import('./pages/user/profile/profile.module')
          .then(m => m.ProfileModule)
      },
      {
        path: 'simple-page',
        loadChildren: () => import('./pages/simple-page/simple-page.module')
          .then(m => m.SimplePageModule)
      },
      {
        path: 'patients',
        loadChildren: () => import('./pages/simple-page/Patient/Patient.module')
          .then(m => m.PatientModule)
  },
  {
        path: 'personnels',
        loadChildren: () => import('./pages/simple-page/personnel/personnel.module')
          .then(m => m.PersonnelModule)
  },
  {
        path: 'rendezvousnonconfirmes',
        loadChildren: () => import('./pages/simple-page/RendezVousNonConfirmes/RendezVousNonConfirmes.module')
          .then(m => m.RendezVousNonConfirmesModule) 
      }
    ]
  },
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () => import('./pages/auth/auth.module')
          .then(m => m.AuthModule)
      }
    ]
    
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
