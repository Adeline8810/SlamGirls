import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necesario para el [(ngModel)]
import { HttpClient } from '@angular/common/http'


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
  filtro: string = '';
  canciones: any[] = [];

  audioUrl: string = '';
  frasesSincronizadas: any[] = [];
  criterioBusqueda: string = '';


  constructor(
    private cancionService: CancionService, // Inyectamos el servicio de canciones
    private router: Router,
    private location: Location,
    private http: HttpClient
  ) {}

  ngOnInit() {
   this.http.get('https://backend-ruth-slam.onrender.com/api/cancion')
    .subscribe((res: any) => {
      console.log("Datos recibidos de la DB:", res); // SI ESTO SALE VACÍO [], NO HABRÁ RESULTADOS
      this.canciones = res;
    });
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
 const buscador = this.terminoBusqueda.toLowerCase().trim();

  if (buscador === '') {
    this.cancionesFiltradas = [];
    return;
  }

  this.cancionesFiltradas = this.canciones.filter(c =>
    c.titulo.toLowerCase().includes(buscador) ||
    c.artista.toLowerCase().includes(buscador)
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

// En tu componente de reproductor/karaoke
cargarCancionDesdeBD(id: number) {
  this.http.get(`https://backend-ruth-slam.onrender.com/api/cancion/${id}`)
    .subscribe({
      next: (cancion: any) => {
        // 1. Cargamos el audio de Cloudinary
        this.audioUrl = cancion.urlAudio;

        // 2. Parseamos la letra (porque en la BD es un String)
        // Importante: Si lo guardaste como JSON, hay que convertirlo a objeto
        this.frasesSincronizadas = JSON.parse(cancion.letraJson);

        console.log("Canción cargada lista para cantar:", cancion.titulo);
      },
      error: (err) => console.error("No se pudo cargar la canción", err)
    });

}
}
