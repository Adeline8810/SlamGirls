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

  // Esta controla el punto verde/gris
despertandoServidor: boolean = false;

// Esta controla si aparece el mensaje de error de abajo
errorCarga: boolean = false;



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

  // Si no hay src o el src está vacío, entonces sí damos el aviso
  if (!audioEl || !audioEl.src || audioEl.src === window.location.href) {
    alert("La pista de audio aún no está lista. Espera un segundo.");
    return;
  }

  try {
    this.grabando = true;
    await this.audioService.iniciarGrabacionConPista(audioEl);
  } catch (error) {
    this.grabando = false;
    alert("Error de micrófono: Asegúrate de dar permisos.");
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
  // 1. Verificación Crítica de Usuario
  const idUsuarioStr = localStorage.getItem('usuarioId');
  const idUsuario = idUsuarioStr ? Number(idUsuarioStr) : null;

  if (!idUsuario || isNaN(idUsuario)) {
    this.detenerCarga();
    alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
    this.router.navigate(['/login']); // Redirección controlada
    return;
  }

  // 2. Preparar Interfaz de Carga
  this.cargandoSubida = true;
  this.porcentajeSubida = 0;
  this.tiempoPublicacion = 0;
  this.errorCarga = false; // Limpiamos errores previos

  this.intervaloTimer = setInterval(() => {
    this.tiempoPublicacion++;
  }, 1000);

  try {
    // 3. Llamada al Servicio (Asegúrate que retorne un Observable)
    const peticion = await this.audioService.detenerYEnviarAlServidor(idUsuario);

    peticion.subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          // Actualización de barra de progreso
          this.porcentajeSubida = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          // Éxito total
          this.porcentajeSubida = 100;
          this.finalizarProcesoExitoso();
        }
      },
      error: (err) => {
        this.detenerCarga();
        console.error("Error en la subida:", err);

        // Si el error es de autenticación (401 o 403), al login
        if (err.status === 401 || err.status === 403) {
          alert("Tu sesión ha caducado.");
          this.router.navigate(['/login']);
        } else {
          alert("No se pudo guardar en el servidor. Revisa tu conexión.");
        }
      }
    });

  } catch (error) {
    this.detenerCarga();
    console.error("Fallo al procesar audio:", error);
    alert("Hubo un problema al procesar el archivo de audio.");
  }
}
  private detenerCarga() {
    clearInterval(this.intervaloTimer);
    this.cargandoSubida = false;
  }

  finalizarProcesoExitoso() {
    clearInterval(this.intervaloTimer);
    this.cargandoSubida = false;
    this.publicadoConExito = true;
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
  this.despertandoServidor = true;
  this.errorCarga = false;

  this.http.get(url).subscribe({
    next: (data: any) => {
      this.cancionSeleccionada = data;
      this.despertandoServidor = false;

      if (this.pistaAudio && data.url_musica) {
        this.pistaAudio.nativeElement.src = data.url_musica;
        this.pistaAudio.nativeElement.load();
        this.vincularProgresoAudio();
      }
    },
    error: (err) => {
      this.despertandoServidor = false;
      // PLAN B: Si el servidor falla (Error 404 con luz-de-luna), cargamos la pista local
      console.warn("Servidor no encontrado o ID inválido. Cargando pista local de prueba...");

      if (this.pistaAudio) {
        this.pistaAudio.nativeElement.src = 'assets/pistas/pista.mp3'; // <--- Tu archivo
        this.pistaAudio.nativeElement.load();
        this.vincularProgresoAudio();
      }

      // Opcional: inventamos datos para que la pantalla no se vea vacía
      this.cancionSeleccionada = { titulo: 'Luz de Luna (Modo Local)' };
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
