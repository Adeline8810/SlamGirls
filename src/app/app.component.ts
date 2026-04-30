import { Component, OnInit } from '@angular/core'; // Te faltaba el OnInit aquí
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importaciones necesarias
import { Router } from '@angular/router';
import { RouterOutlet, RouterModule } from '@angular/router'; // Importa RouterModule
import { CommonModule } from '@angular/common'; // Importa CommonModule

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule,RouterModule,CommonModule], // Agrega HttpClientModule aquí
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class AppComponent implements OnInit { // Ahora sí reconoce el OnInit
   selectedTabNav: string = 'moi';
   notificaciones = 5;

  constructor(private http: HttpClient,private router: Router) {}

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
      .subscribe({
        next: () => console.log("✅ Servidor despertado con éxito"),
        error: () => console.log("⏳ El servidor está despertando... espera unos segundos")
      });
  }
}
