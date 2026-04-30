
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importaciones necesarias


import { Component, OnInit } from '@angular/core'; // <--- Añade OnInit aquí
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule,RouterModule,CommonModule], // Agrega HttpClientModule aquí
 templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit { // Ahora sí reconoce el OnInit
   selectedTabNav: string = 'moi';
   notificaciones = 5;
   mostrarMenu: boolean = false;

  constructor(private http: HttpClient,private router: Router) {
   // Escuchamos los cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
    // Obtenemos la ruta actual
    const rutaActual = event.urlAfterRedirects;

    // 1. Páginas donde NO debe verse el menú (Añade aquí las de login/registro)
    const esLoginORegistro = rutaActual === '/' ||
                             rutaActual === '/login' ||
                             rutaActual.includes('registro');

    // 2. Verificamos si realmente hay un ID de usuario en el storage
    const tieneUsuario = !!localStorage.getItem('usuarioId');

    // SOLO se muestra si NO es login/registro Y tiene usuario
    this.mostrarMenu = tieneUsuario && !esLoginORegistro;

    console.log('¿Mostrar menú?:', this.mostrarMenu, 'Ruta:', rutaActual);
  });
  }


  navegar(ruta: string) {
  // Determinamos cuál está activo para el color rosa
  if (ruta.includes('profile')) this.selectedTabNav = 'moi';
  if (ruta.includes('discussion')) this.selectedTabNav = 'chat';
  if (ruta.includes('moment')) this.selectedTabNav = 'moment';
  if (ruta.includes('salle')) this.selectedTabNav = 'salle';

  this.router.navigate([ruta]);
}

  ngOnInit() {
    // Mandamos el "codazo" al servidor apenas carga la app
    this.http.get('https://backend-ruth-slam.onrender.com/api/usuarios/ping')
     .subscribe((event: any) => {
    if (event instanceof NavigationEnd) {
        const usuarioLogueado = localStorage.getItem('usuario');
        // Usamos event.urlAfterRedirects que es más seguro
        const esRutaPublica = event.urlAfterRedirects === '/' ||
                             event.urlAfterRedirects === '/login' ||
                             event.urlAfterRedirects.includes('registro');

        this.mostrarMenu = !!usuarioLogueado && !esRutaPublica;
    }
});
  }
}
