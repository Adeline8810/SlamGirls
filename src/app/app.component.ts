
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
      // 1. Verificamos si existe usuario en el storage
      const usuarioLogueado = localStorage.getItem('usuario');

      // 2. Verificamos que NO estemos en el login o registro
      const esRutaPublica = event.url === '/' || event.url === '/login' || event.url.includes('registro');

      // Solo mostramos si hay usuario Y no estamos en el inicio
      this.mostrarMenu = !!usuarioLogueado && !esRutaPublica;
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
