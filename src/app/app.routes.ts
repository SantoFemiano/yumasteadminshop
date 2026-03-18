import { RegisterComponent } from './components/register/register';
import {Routes} from '@angular/router';
import {LoginComponent} from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import {MagazziniComponent} from './components/magazzini/magazzini';
import {BoxComponent} from './components/box/box';
import {ScontiComponent} from './components/sconti/sconti';
import {ScontiBoxComponent} from './components/sconti-box/sconti-box';
import {IngredientiComponent} from './components/ingredienti/ingredienti';
import {AddIngredienteBoxComponent} from './components/add-ingrediente-box/add-ingrediente-box';
import {OrdiniClientiComponent} from './components/ordini-clienti/ordini-clienti';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'magazzini', component: MagazziniComponent, canActivate: [authGuard] },
  { path: 'box', component: BoxComponent, canActivate: [authGuard] },
  { path: 'sconti', component: ScontiComponent, canActivate: [authGuard] },
  { path: 'sconti-box', component: ScontiBoxComponent, canActivate: [authGuard] },
  { path: 'ingredienti', component: IngredientiComponent, canActivate: [authGuard] },
  {path: 'ingrediente-box', component:AddIngredienteBoxComponent, canActivate: [authGuard] },
  {path: 'ordini-clienti', component:OrdiniClientiComponent, canActivate: [authGuard] },

  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
