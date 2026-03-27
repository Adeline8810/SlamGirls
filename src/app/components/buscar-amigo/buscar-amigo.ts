import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TraduccionService } from '../../../services/traduccion.service';

@Component({
  selector: 'app-buscar-amigo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-amigo.html',
  styleUrl: './buscar-amigo.css',
})
// ... (imports y decorador @Component)
// ... imports
export class BuscarAmigo {
  busquedaNombre: string = '';
  amigosEncontrados: any[] = [];
  respuestasAmigo: any[] = []; // Aquí llegarán los 3 campos del DTO
  cargando: boolean = false;
  mostrarSlam: boolean = false;

  constructor(private miServicio: TraduccionService) { }

  buscarAmigos() {
    if (!this.busquedaNombre.trim()) return;
    this.cargando = true;
    this.mostrarSlam = false;
    this.amigosEncontrados = [];

    this.miServicio.buscarUsuarios(this.busquedaNombre).subscribe({
      next: (data) => {
        this.amigosEncontrados = data;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  verSlam(amigo: any) {
    this.cargando = true;
    this.respuestasAmigo = []; // 🔥 Limpieza crítica para evitar duplicados

    // Usamos el username único que definimos en el Backend
    this.miServicio.buscarRespuestasPorAmigo(amigo.username).subscribe({
      next: (data) => {
        this.respuestasAmigo = data; // Ahora contiene: pregunta, respuesta, fotoUrl
        this.mostrarSlam = true;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.respuestasAmigo = []; // Si hay error, también limpiamos
      }

    });
  }

  volverALista() {
    this.mostrarSlam = false;
    this.respuestasAmigo = [];
  }


  volverAlBuscadorMain() {
    this.mostrarSlam = false;
    this.respuestasAmigo = [];
    this.amigosEncontrados = []; // 🔥 Limpia la lista de amigos
    this.busquedaNombre = '';   // 🔥 Limpia la barra de búsqueda
  }


  obtenerTiempo() { return new Date().getTime(); }

}
