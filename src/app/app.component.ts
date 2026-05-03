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
  private httpAuth: Auth = inject(Auth);

  // El constructor ahora solo inyecta las herramientas, no ejecuta lógica pesada
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // 1. DESPERTAR AL SERVIDOR
    // Esto se ejecuta una sola vez al cargar la app para que Render se encienda
    this.http.get('https://backend-ruth-slam.onrender.com/api/usuarios/ping').subscribe({
      next: () => console.log('Servidor despertando...'),
      error: () => console.log('El servidor aún está durmiendo, pero ya recibió el aviso.')
    });

    // 2. LÓGICA DE RUTAS ÚNICA
    // Centralizamos aquí todo para evitar conflictos
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const rutaActual = event.urlAfterRedirects;

        // Reglas de pantallas donde NO se debe ver el menú
        const esLoginORegistro = rutaActual === '/' ||
                                 rutaActual === '/login' ||
                                 rutaActual.includes('registro');

        const esPantallaGrabacion = rutaActual.includes('cantar');

        // Verificamos si hay sesión activa (puedes usar 'usuario' o 'usuarioId')
        const tieneUsuario = !!localStorage.getItem('usuario');

        // Lógica final: Solo se muestra si hay usuario Y no es una ruta prohibida
        this.mostrarMenu = tieneUsuario && !esLoginORegistro && !esPantallaGrabacion;

        console.log('¿Mostrar menú?:', this.mostrarMenu, 'Ruta:', rutaActual);
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
