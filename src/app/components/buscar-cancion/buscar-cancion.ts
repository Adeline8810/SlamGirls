import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { UsuarioService } from '../../../services/usuario.service'; // Usaremos el método buscarUsuarios que ya tienes

@Component({
  selector: 'app-buscar-cancion',
  templateUrl: './buscar-cancion.html',
  styleUrls: ['./buscar-cancion.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BuscarCancion {

  resultados: any[] = [];
  buscando: boolean = false;

  grabando: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private location: Location
  ) {}

  // Función para el botón de atrás
  irAtras() {
    this.location.back();
  }

  // Función que se activa con el (input) del HTML
  buscar(event: any) {
    const termino = event.target.value;

    if (termino.length < 2) {
      this.resultados = [];
      return;
    }

    this.buscando = true;

    // Usamos el método que ya definimos en tu service
    this.usuarioService.buscarUsuarios(termino).subscribe({
      next: (data) => {
        this.resultados = data;
        this.buscando = false;
      },
      error: (err) => {
        console.error("Error en la búsqueda:", err);
        this.buscando = false;
      }
    });
  }

  // Al darle al botón rosa "CHANTER"
seleccionarCancion(slug: string) {
  console.log('Intentando ir a cantar:', slug);

  // Limpiamos cualquier error previo
  this.grabando = false;

  // Navegamos a la ruta específica
  // IMPORTANTE: Asegúrate de que en app.routes.ts tengas { path: 'cantar/:id', ... }
  this.router.navigate(['/cantar', slug]).then(nav => {
    if(nav) {
      console.log('Navegación exitosa a cantar');
    } else {
      console.error('La navegación falló. Revisa tus rutas en app.routes.ts');
    }
  });
}
}
