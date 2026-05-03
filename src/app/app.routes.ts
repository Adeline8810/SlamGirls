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
import { PerfilAjeno } from './components/perfil-ajeno/perfil-ajeno';
import { Chat } from './components/chat/chat';
import { Cantar } from './components/cantar/cantar';
import { BuscarCancion } from './components/buscar-cancion/buscar-cancion';
import {  EditorCanciones } from './editor-canciones/editor-canciones';
import { Inicio } from './components/inicio/inicio';
import { EnVivo } from './components/en-vivo/en-vivo';
import { VerLive } from './components/ver-live/ver-live';


export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'bienvenida', component: LandingComponent },
  { path: 'en-vivo', component: EnVivo },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'slam', component: SlamComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'buscar-amigo', component: BuscarAmigo },
  { path: 'buscar-usuario', component: BuscarUsuario },
  { path: 'recargar', component: Recargar },
  { path: 'tienda', component: Tienda },
  { path: 'profile', component: Profile },
  { path: 'perfil/:username', component: PerfilAjeno },
  { path: 'chat/:username', component: Chat },
  { path: 'cantar/:id', component: Cantar },
  { path: 'buscar-cancion', component: BuscarCancion },
  { path: 'editor-canciones', component: EditorCanciones },
  { path: 'tienda', component: Tienda },
  { path: 'ver-live/:id',component: VerLive },



  { path: '**', redirectTo: '' }
];
