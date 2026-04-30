import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { AudioKaraokeService } from '../../../services/audio-karaoke.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // <--- Añadido Router
import { HttpClient } from '@angular/common/http';
import { HttpEventType } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // <--- Importante para los sliders y inputs

@Component({
  selector: 'app-cantar',
  standalone: true,
  imports: [CommonModule, FormsModule], // <--- Añadido FormsModule
  templateUrl: './cantar.html',
  styleUrls: ['./cantar.css']
})
export class Cantar implements OnInit, AfterViewInit {
  // Referencia única al audio
  @ViewChild('pistaAudio') pistaAudio!: ElementRef<HTMLAudioElement>;

  // Estados de flujo
  grabando: boolean = false;
  cargandoSubida: boolean = false;
  pasoActual: number = 1;

  // Variables para la letra
  letraActual: string = 'Presiona comenzar para iniciar...';
  letraSiguiente: string = '';

  // Datos de canciones y covers
  listaDeCantos: any[] = [];
  cancionSeleccionada: any = null;

  // AJUSTES DE AUDIO (Paso 2)
  volumenVoz: number = 90;
  volumenMusica: number = 60;
  efectoSeleccionado: string = 'Ninguno';

  // PUBLICACIÓN (Paso 3)
  descripcionPost: string = '';
  imagenPortada: File | null = null;
  previewPortada: string | null = null;

  // --- VARIABLES PARA EL PROGRESO (Las que faltaban) ---
  porcentajeSubida: number = 0;
  tiempoPublicacion: number = 0;
  intervaloTimer: any;
  publicadoConExito: boolean = false;

  constructor(
    private audioService: AudioKaraokeService,
    private route: ActivatedRoute,
    private router: Router, // <--- Inyectado
    private http: HttpClient
  ) {}




  ngOnInit() {
    const idCancion = this.route.snapshot.paramMap.get('id');
    if (idCancion) {
      this.obtenerDetalleCancion(idCancion);
    } else {
      this.letraActual = 'Selecciona una canción primero.';
    }
    this.cargarMisCovers();
  }

  lineasLetra: any[] = [
  { tiempo: 0, texto: "Prepárate..." },
  { tiempo: 5, texto: "En la arena solo los ojos" },
  { tiempo: 10, texto: "Bajo el sol de mediodía" },
  { tiempo: 15, texto: "Buscando tu rastro" }
];

indiceActivo: number = 0;

  ngAfterViewInit() {
    // La carga inicial se maneja en obtenerDetalleCancion para asegurar que existan los datos
  }

  async iniciar() {
    const audioEl = this.pistaAudio?.nativeElement;
    if (!audioEl) {
      console.error("No se encontró el elemento audio");
      return;
    }

    try {
      this.grabando = true;
      this.pasoActual = 1;
      await this.audioService.iniciarGrabacionConPista(audioEl);
    } catch (error) {
      console.error("Error al iniciar:", error);
      this.grabando = false;
      alert("No se pudo acceder al micrófono o a la pista de audio.");
    }
  }

  async finalizarCanto() {
    this.grabando = false;

    if (this.pistaAudio) {
      this.pistaAudio.nativeElement.pause();
      this.pistaAudio.nativeElement.currentTime = 0;
    }

    this.audioService.detenerFlujoAudio();
    this.pasoActual = 2; // Ir a edición
  }

  async publicarTodo() {
    this.cargandoSubida = true;
    this.porcentajeSubida = 0;
    this.tiempoPublicacion = 0;

    this.intervaloTimer = setInterval(() => {
      this.tiempoPublicacion++;
    }, 1000);

    try {
      const idUsuario = Number(localStorage.getItem('usuarioId'));
      if (!idUsuario) {
        this.detenerCarga();
        alert("Inicia sesión de nuevo.");
        return;
      }

      const peticion = await this.audioService.detenerYEnviarAlServidor(idUsuario);

      peticion.subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.porcentajeSubida = Math.round((100 * event.loaded) / event.total);
          } else if (event.type === HttpEventType.Response) {
            this.porcentajeSubida = 100;
            this.finalizarProcesoExitoso();
          }
        },
        error: (err) => {
          this.detenerCarga();
          console.error("Error al subir:", err);
          alert("Error al guardar en el servidor.");
        }
      });

    } catch (error) {
      this.detenerCarga();
      this.cargandoSubida = false;
      clearInterval(this.intervaloTimer);
      console.error("El servidor rechazó el archivo:", error);
      alert("El archivo es muy pesado o la conexión es inestable.");
    }
  }

  private detenerCarga() {
    clearInterval(this.intervaloTimer);
    this.cargandoSubida = false;
  }

  finalizarProcesoExitoso() {
    clearInterval(this.intervaloTimer);
    setTimeout(() => {
      this.cargandoSubida = false;
      setTimeout(() => {
    this.cargandoSubida = false;
    this.publicadoConExito = true;
  }, 500);
      this.router.navigate(['/buscar']); // Asegúrate que esta ruta existe
    }, 1000);
  }

  irAPublicar() {
    this.pasoActual = 3;
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
      next: (data: any) => {
        this.cancionSeleccionada = data;
        if (this.pistaAudio) {
          this.pistaAudio.nativeElement.src = data.url_pista;
          this.pistaAudio.nativeElement.load();
        }
      },
      error: (err) => {
        this.cancionSeleccionada = { titulo: "Error de servidor", url_pista: "" };
        alert("El servidor está despertando. Intenta de nuevo en unos segundos.");
      }
    });
  }

  onPortadaSeleccionada(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenPortada = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewPortada = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  irAtras() {
    window.history.back();
  }

  manejarErrorImagen(event: any) {
    event.target.src = 'assets/img/default-cover.png';
  }


  // Método que se llama cuando el audio avanza
vincularProgresoAudio() {
  const audio = this.pistaAudio.nativeElement;

  audio.ontimeupdate = () => {
    const tiempoActual = audio.currentTime;

    // Buscar qué línea corresponde al tiempo actual
    const encontrada = this.lineasLetra.findIndex((l, i) => {
      const siguienteTiempo = this.lineasLetra[i+1]?.tiempo || 9999;
      return tiempoActual >= l.tiempo && tiempoActual < siguienteTiempo;
    });

    if (encontrada !== -1 && encontrada !== this.indiceActivo) {
      this.indiceActivo = encontrada;
      this.scrollALineaActiva();
    }
  };
}

scrollALineaActiva() {
  const activeEl = document.querySelector('.lyric-line.active');
  if (activeEl) {
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
}
