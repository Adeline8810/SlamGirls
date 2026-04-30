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

  // Verificamos si el audio tiene algo cargado
  if (!audioEl || !audioEl.src || audioEl.src === "") {
    alert("Todavía no se ha detectado el archivo pista.mp3 en assets.");
    return;
  }

  try {
    this.grabando = true;
    this.pasoActual = 1;
    // Iniciamos la grabación con el archivo local
    await this.audioService.iniciarGrabacionConPista(audioEl);
  } catch (error) {
    this.grabando = false;
    console.error("Error al iniciar:", error);
    alert("Revisa los permisos del micrófono.");
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
  // 1. Verificación Crítica de Usuario (Se mantiene igual)
  const idUsuarioStr = localStorage.getItem('usuarioId');
  // AQUÍ DEBES PONERLO:
  console.log("🔍 REVISIÓN DE SESIÓN:");
  console.log("ID recuperado de localStorage:", idUsuarioStr);
  console.log("Tipo de dato:", typeof idUsuarioStr);

  const idUsuario = idUsuarioStr ? Number(idUsuarioStr) : null;

  if (!idUsuario || isNaN(idUsuario)) {
    this.detenerCarga();
    alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
    this.router.navigate(['/login']);
    return;
  }

  // 2. Preparar Interfaz de Carga (Se mantiene igual)
  this.cargandoSubida = true;
  this.porcentajeSubida = 0;
  this.tiempoPublicacion = 0;
  this.errorCarga = false;

  this.intervaloTimer = setInterval(() => {
    this.tiempoPublicacion++;
  }, 1000);

  try {
    const peticion = await this.audioService.detenerYEnviarAlServidor(idUsuario);

    peticion.subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.porcentajeSubida = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.porcentajeSubida = 100;

          // AQUÍ SE DISPARA EL ÉXITO
          this.finalizarProcesoExitoso();
        }
      },
      error: (err) => {
  this.detenerCarga();
  console.error("Detalle del error:", err); // Revisa la consola del navegador (F12)

  if (err.status === 401 || err.status === 403) {
    // Solo si el error es realmente de sesión
    this.router.navigate(['/login']);
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
  console.log("✅ ¡LLEGAMOS A LA FUNCIÓN DE ÉXITO!");
  // 1. Limpiamos el intervalo del cronómetro inmediatamente
  if (this.intervaloTimer) {
    clearInterval(this.intervaloTimer);
  }

  // 2. Quitamos la pantalla de "Publicando" y activamos el Check de éxito
  this.cargandoSubida = false;
  this.publicadoConExito = true;

  // 3. Esperamos un momento para que el usuario vea el aspa verde antes de irse
  setTimeout(() => {
    // Aseguramos que los estados de carga estén apagados
    this.cargandoSubida = false;

    // Redirigimos a la pantalla de buscar canciones
    // Nota: Asegúrate de que en tu app-routing.module.ts la ruta sea exactamente 'buscar'
    this.router.navigate(['/buscar-cancion']);

    // Opcional: Reiniciamos el estado de éxito después de navegar
    // para que no aparezca el modal la próxima vez que entre
    setTimeout(() => {
      this.publicadoConExito = false;
    }, 500);

  }, 2000); // Le damos 2 segundos para que disfrute su éxito
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
  // Mantenemos esto para que la interfaz no se rompa
  this.despertandoServidor = false;
  this.errorCarga = false;

  // Forzamos los datos manualmente (Hardcoded)
  this.cancionSeleccionada = {
    titulo: 'Luz de Luna',
    artista: 'Sailor Moon'
  };

  // CRÍTICO: Cargamos directamente tu archivo local
  // Asegúrate de que la ruta sea exactamente donde está tu pista.mp3
  setTimeout(() => {
    if (this.pistaAudio) {
      this.pistaAudio.nativeElement.src = 'assets/pistas/pista.mp3';
      this.pistaAudio.nativeElement.load();
      this.vincularProgresoAudio();
      console.log("Pista local cargada correctamente para pruebas");
    }
  }, 500);
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
