import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { SlamComponent } from './pages/slam/slam.component';
import { AdminComponent } from './pages/admin/admin.component';
import { BuscarAmigo } from './components/buscar-amigo/buscar-amigo';
import { BuscarUsuario } from './components/buscar-usuario/buscar-usuario';
import { Recargar } from './components/recargar/recargar';
import { Tienda } from './components/tienda/tienda';
import { Profile } from './components/profile/profile';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'slam', component: SlamComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'buscar-amigo', component: BuscarAmigo },
  { path: 'buscar-usuario', component: BuscarUsuario },
  { path: 'recargar', component: Recargar },
  { path: 'tienda', component: Tienda },
  { path: 'profile', component: Profile },
  { path: '**', redirectTo: '' }
];
