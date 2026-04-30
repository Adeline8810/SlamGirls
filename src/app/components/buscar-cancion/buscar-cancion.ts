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
  seleccionarCancion(cancionId: any) {
    // Aquí es donde el flujo continúa hacia la sala de grabación (Paso 2)
    console.log("Iniciando grabación de:", cancionId);
    // Por ahora te lleva a la sala de grabación pasándole el ID
    this.router.navigate(['/cantar'], { queryParams: { id: cancionId } });
    //this.router.navigate(['/cantar', cancionId]);
  }
}
