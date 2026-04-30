import { Component,ViewChild,ElementRef, OnInit } from '@angular/core';
import { AudioKaraokeService } from '../../../services/audio-karaoke.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // <--- Para leer el ID
import { HttpClient } from '@angular/common/http'


@Component({
  selector: 'app-cantar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cantar.html',
  styleUrls: ['./cantar.css']
})
export class Cantar {
  @ViewChild('pistaAudio') pista!: ElementRef<HTMLAudioElement>;
  grabando: boolean = false;
  cargandoSubida: boolean = false;
  letraActual: string = 'Presiona comenzar para iniciar...';
  letraSiguiente: string = '';
  listaDeCantos: any[] = [];
  cancionSeleccionada: any = null;
  pasoActual: number = 1;

  volumenVoz: number = 90;
  volumenMusica: number = 60;
 efectoSeleccionado: string = 'Ninguno';

  descripcionPost: string = '';
  imagenPortada: File | null = null;
  previewPortada: string | null = null;


  constructor(private audioService: AudioKaraokeService, private route: ActivatedRoute,
    private http: HttpClient ) {}

  ngOnInit() {
    const idCancion = this.route.snapshot.paramMap.get('id');

    if (idCancion) {
      this.obtenerDetalleCancion(idCancion);
    } else {
      this.letraActual = 'Selecciona una canción primero.';
    }
    this.cargarMisCovers();
  }

async iniciar() {
    try {

      this.grabando = true;
      // Llamamos al nuevo método que mezcla Voz + Eco + Música
      await this.audioService.iniciarGrabacionConPista(this.pista.nativeElement);
    } catch (error) {
      console.error("Error al iniciar:", error);
      this.grabando = false;
      alert("No se pudo acceder al micrófono o a la pista de audio.");
    }
  }

 // 4. FINALIZAR: Detenemos la música y el eco
  async finalizarCanto() {
    this.cargandoSubida = true;
    this.grabando = false; // Cambiamos el estado visual de inmediato

    // Detener la música físicamente
    if (this.pista) {
      this.pista.nativeElement.pause();
      this.pista.nativeElement.currentTime = 0;
    }

    // Detener eco y micrófono
    this.audioService.detenerFlujoAudio();

    try {
      const idUsuario = Number(localStorage.getItem('usuarioId'));
      if (!idUsuario) {
        alert("Inicia sesión de nuevo.");
        this.cargandoSubida = false;
        return;
      }

      const peticion = await this.audioService.detenerYEnviarAlServidor(idUsuario);

      peticion.subscribe({
        next: (res) => {
          this.cargandoSubida = false;
          alert("¡Tu cover se ha guardado con éxito! 🎤");
          this.cargarMisCovers();
        },
        error: (err) => {
          this.cargandoSubida = false;
          console.error("Error al subir:", err);
        }
      });

    this.grabando = false;
    this.pasoActual = 2; // Saltamos a la pantalla de edición

    } catch (error) {
      this.cargandoSubida = false;
      console.error("Error:", error);
    }
  }


irAPublicar() {
  this.pasoActual = 3; // Saltamos a la pantalla final
}


cargarMisCovers() {
    const idUsuario = Number(localStorage.getItem('usuarioId'));
    if (idUsuario) {
      this.audioService.obtenerMisCantos(idUsuario).subscribe(data => {
        this.listaDeCantos = data;
      });
    }
  }

obtenerDetalleCancion(id: string) {
  const url = `https://backend-ruth-slam.onrender.com/api/videos/detalle/${id}`;

  this.http.get(url).subscribe({
    next: (data) => {
      this.cancionSeleccionada = data;
    },
    error: (err) => {
      console.error("El servidor devolvió un error de texto:", err);
      // Creamos un objeto temporal para que la página NO se rompa
      this.cancionSeleccionada = {
        titulo: "Error de servidor",
        url_pista: ""
      };
      alert("El servidor de Render está tardando en despertar. Intenta en 10 segundos.");
    }
  });
}


onPortadaSeleccionada(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.imagenPortada = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewPortada = reader.result as string; // Esto genera la miniatura
    };
    reader.readAsDataURL(file);
  }
}
irAtras() {
  window.history.back();
}

manejarErrorImagen(event: any) {
  // Si la imagen falla, ponemos una de reemplazo automáticamente
  event.target.src = 'assets/img/default-cover.png';
}
}
