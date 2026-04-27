import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Importamos el nuevo componente que acabas de crear
import { BuscarAmigo } from './components/buscar-amigo/buscar-amigo';
import { BuscarUsuario } from './components/buscar-usuario/buscar-usuario';
import { Recargar } from './components/recargar/recargar';
import { Tienda } from './components/tienda/tienda';
import { Profile } from './components/profile/profile';
import { PerfilAjeno } from './components/perfil-ajeno/perfil-ajeno';


const routes: Routes = [
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'administrar-preguntas',
    loadComponent: () =>
      import('./administrar-preguntas/administrar-preguntas.component').then(m => m.AdministrarPreguntasComponent)
  },
  {
    path: 'ver-usuarios',
    loadComponent: () =>
      import('./ver-usuarios/ver-usuarios.component').then(m => m.VerUsuariosComponent)
  },
  {
    path: 'ver-respuestas',
    loadComponent: () =>
      import('./ver-respuestas/ver-respuestas.component').then(m => m.VerRespuestasComponent)
  },


  {
    path: 'buscar-amigo',
    component: BuscarAmigo
  },

    {
    path: 'buscar-usuario',
    component: BuscarUsuario
  },

   {
    path: 'recargar',
    component: Recargar
  },

     {
    path: 'tienda',
    component: Tienda
  },

    {
    path: 'profile',
    component: Profile
  },


{ path: 'perfil/:username', component: PerfilAjeno },



  { path: '**', redirectTo: '/admin' }


,

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
