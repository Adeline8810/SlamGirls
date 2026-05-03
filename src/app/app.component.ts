import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  selectedTabNav: string = 'moi';
  notificaciones = 5;
  mostrarMenu: boolean = false;


  // El constructor ahora solo inyecta las herramientas, no ejecuta lógica pesada
  constructor(private http: HttpClient, private router: Router) {}

 ngOnInit() {
  // 1. DESPERTAR AL SERVIDOR (Con retraso para evitar bloqueo inicial)
  // Envolvemos el ping en un setTimeout de 2 segundos.
  // Esto permite que el HTML cargue PRIMERO y el ping ocurra DESPUÉS.
  /*setTimeout(() => {
    this.http.get('https://backend-ruth-slam.onrender.com/api/usuarios/ping').subscribe({
      next: () => console.log('✅ Backend contactado con éxito'),
      error: (err) => {
        console.warn('⏳ El servidor está despertando... (NG0201 evitado)');
      }
    });
  }, 2000);*/

  // 2. LÓGICA DE RUTAS ÚNICA (Se mantiene intacta)
  this.router.events.subscribe((event: any) => {
    if (event instanceof NavigationEnd) {
      const rutaActual = event.urlAfterRedirects;

      // Definimos rutas públicas
      const esLoginORegistro = rutaActual === '/' ||
                               rutaActual === '/login' ||
                               rutaActual.includes('registro');

      const esPantallaGrabacion = rutaActual.includes('cantar');

      // Verificamos sesión
      const tieneUsuario = !!localStorage.getItem('usuario');

      // Decidimos si mostrar el menú
      this.mostrarMenu = tieneUsuario && !esLoginORegistro && !esPantallaGrabacion;

      console.log('📱 Estado del menú:', this.mostrarMenu, '| Ruta:', rutaActual);
    }
  });
}

  navegar(ruta: string) {
    // Actualizamos el icono activo para el estilo visual
    if (ruta.includes('profile')) this.selectedTabNav = 'moi';
    if (ruta.includes('discussion')) this.selectedTabNav = 'chat';
    if (ruta.includes('moment')) this.selectedTabNav = 'moment';
    if (ruta.includes('salle')) this.selectedTabNav = 'salle';

    this.router.navigate([ruta]);
  }



}
