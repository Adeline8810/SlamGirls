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
  // 1. DESPERTAR AL SERVIDOR (Fuego y olvido)
  // Usamos un objeto observador completo para atrapar el error
  // y evitar que rompa el inicio de la aplicación.
  this.http.get('https://backend-ruth-slam.onrender.com/api/usuarios/ping').subscribe({
    next: () => console.log('✅ Backend contactado con éxito'),
    error: (err) => {
      // Si el servidor está dormido, dará error de timeout o conexión,
      // pero esto ya no detendrá tu pantalla blanca.
      console.warn('⏳ El servidor está despertando... (NG0201 ignorado visualmente)');
    }
  });

  // 2. LÓGICA DE RUTAS ÚNICA
  // Se ejecuta inmediatamente y por separado del HTTP.
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
