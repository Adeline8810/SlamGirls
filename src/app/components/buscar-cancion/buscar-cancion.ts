import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necesario para el [(ngModel)]

// Importamos los servicios necesarios
import { CancionService } from '../../../services/cancion.service';

@Component({
  selector: 'app-buscar-cancion',
  templateUrl: './buscar-cancion.html',
  styleUrls: ['./buscar-cancion.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule] // Añadimos FormsModule
})
export class BuscarCancion implements OnInit {

  cancionesOriginales: any[] = [];
  cancionesFiltradas: any[] = [];
  terminoBusqueda: string = '';
  cargando: boolean = false;

  constructor(
    private cancionService: CancionService, // Inyectamos el servicio de canciones
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.cargarCanciones();
  }

  cargarCanciones() {
    this.cargando = true;
    this.cancionService.obtenerTodas().subscribe({
      next: (data) => {
        this.cancionesOriginales = data;
        this.cancionesFiltradas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error cargando canciones:", err);
        this.cargando = false;
      }
    });
  }

  // Filtra localmente mientras el usuario escribe
  filtrar() {
    const termino = this.terminoBusqueda.toLowerCase().trim();

    if (!termino) {
      this.cancionesFiltradas = this.cancionesOriginales;
      return;
    }

    this.cancionesFiltradas = this.cancionesOriginales.filter(c =>
      c.titulo?.toLowerCase().includes(termino) ||
      c.artista?.toLowerCase().includes(termino)
    );
  }

  irAtras() {
    this.location.back();
  }

  // Esta es la función que activa el botón CHANTER
  irACantar(cancion: any) {
    console.log('Navegando a karaoke de:', cancion.titulo);
    // IMPORTANTE: Asegúrate que en app.routes.ts la ruta sea 'cantar/:id'
    this.router.navigate(['/cantar', cancion.id]);
  }

  irAlEditor() {
    this.router.navigate(['/editor-canciones']);
  }
}
