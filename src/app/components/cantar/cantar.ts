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

  idCancion: string | null = null;
  cancion: any;

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


  // Variable para la URL de Cloudinary que usará el reproductor de audio [src]
  pistaAudioUrl: string = '';

  // Variable para guardar el array de frases (la letra parseada)
  frasesSincronizadas: any[] = [];

  // Variable para controlar qué línea de la letra se debe resaltar
  indiceActivo: number = 0;



  constructor(
    private audioService: AudioKaraokeService,
    private route: ActivatedRoute,
    private router: Router, // <--- Inyectado
    private http: HttpClient
  ) {}




  ngOnInit() {
  // 1. Capturamos el ID de la URL
  this.idCancion = this.route.snapshot.paramMap.get('id');

  if (this.idCancion) {
    this.despertandoServidor = true; // Iniciamos estado de carga
    this.errorCarga = false;

    this.http.get(`https://backend-ruth-slam.onrender.com/api/cancion/${this.idCancion}`)
      .subscribe({
        next: (data: any) => {
  this.cancion = data;
  this.cancionSeleccionada = data;
  this.pistaAudioUrl = data.urlAudio;

  // IMPORTANTE: Java te devolverá el campo como 'letraJson' (CamelCase)
  if (data.letraJson) {
    try {
      const objetoCompleto = typeof data.letraJson === 'string'
        ? JSON.parse(data.letraJson)
        : data.letraJson;

      // Aquí está el truco: Entramos a la propiedad .letras
      if (objetoCompleto && objetoCompleto.letras) {
        this.frasesSincronizadas = objetoCompleto.letras;
        console.log("✅ Frases cargadas con éxito:", this.frasesSincronizadas);
      } else {
        // Por si acaso el formato cambia, intentamos leerlo directo
        this.frasesSincronizadas = Array.isArray(objetoCompleto) ? objetoCompleto : [];
      }
    } catch (e) {
      console.error("Error al procesar el JSON:", e);
      this.frasesSincronizadas = [];
    }
  }
  this.despertandoServidor = false;
}
      });
  } else {
    console.error("❌ No se encontró un ID en la URL. Ejemplo de ruta correcta: /cantar/1");
  }
}




  ngAfterViewInit() {
    // La carga inicial se maneja en obtenerDetalleCancion para asegurar que existan los datos
  }

async iniciar() {
  const audioEl = this.pistaAudio?.nativeElement;

  // ELIMINAMOS el alert que pedía el archivo en assets
  try {
    this.grabando = true;
    this.pasoActual = 1;

    // El service ahora recibirá la URL de Cloudinary que ya cargamos en el audioEl.src
    await this.audioService.iniciarGrabacionConPista(audioEl);
  } catch (error) {
    this.grabando = false;
    console.error("Error al iniciar:", error);
    alert("Revisa los permisos del micrófono.");
  }
}
async finalizarCanto() {
  // 1. Cambiamos el estado de grabación inmediatamente
  this.grabando = false;

  // 2. Detenemos el audio de fondo
  if (this.pistaAudio && this.pistaAudio.nativeElement) {
    this.pistaAudio.nativeElement.pause();
    this.pistaAudio.nativeElement.currentTime = 0;
  }

  try {
    // 3. Detenemos el flujo de audio (RecordRTC / MediaStream)
    // Usamos 'await' para asegurar que el servicio termine de cerrar los tracks
    await this.audioService.detenerFlujoAudio();

    // 4. Salto al Paso 2 (Edición)
    // Usamos setTimeout para "limpiar" la pila de ejecución.
    // Esto evita el error NG02020 al darle tiempo a Angular de
    // destruir el visualizador del paso 1 antes de pintar el paso 2.
    setTimeout(() => {
      this.pasoActual = 2;
    }, 100);

  } catch (error) {
    console.error("Error al finalizar el flujo de audio:", error);
    // Aun con error, intentamos ir al paso 2 para no bloquear al usuario
    this.pasoActual = 2;
  }
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




scrollALineaActiva() {
  const activeEl = document.querySelector('.lyric-line.active');
  if (activeEl) {
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}




actualizarTiempo() {
  if (!this.pistaAudio || !this.pistaAudio.nativeElement || this.frasesSincronizadas.length === 0) {
    return;
  }

  // Añadimos un pequeño "ajuste de anticipación" (0.1 o 0.2 segundos)
  // para que el ojo humano sienta que la letra cambia justo a tiempo.
  const tiempoActual = this.pistaAudio.nativeElement.currentTime + 0.1;

  // BUSQUEDA INVERSA: Encuentra la última frase que ya debería haber empezado
  let indiceEncontrado = -1;
  for (let i = 0; i < this.frasesSincronizadas.length; i++) {
    if (tiempoActual >= this.frasesSincronizadas[i].tiempo) {
      indiceEncontrado = i;
    } else {
      break; // Si el tiempo de la frase es mayor al actual, dejamos de buscar
    }
  }

  // Solo actualizamos si el índice es válido y ha cambiado
  if (indiceEncontrado !== -1 && indiceEncontrado !== this.indiceActivo) {
    this.indiceActivo = indiceEncontrado;
    this.hacerScrollFocalizado();

    // Log para que verifiques en consola si el tiempo coincide con lo que escuchas
    console.log(`⏱️ Audio: ${tiempoActual.toFixed(2)}s -> Frase: ${this.frasesSincronizadas[indiceEncontrado].texto}`);
  }
}

hacerScrollFocalizado() {
  // Esperamos un milisegundo a que Angular actualice la clase .activa en el HTML
  setTimeout(() => {
    const elementoActivo = document.querySelector('.frase-karaoke.activa');

    if (elementoActivo) {
      // El método scrollIntoView desliza la pantalla suavemente
      elementoActivo.scrollIntoView({
        behavior: 'smooth',   // Movimiento suave, no de golpe
        block: 'center'       // Pone la frase justo en el centro de la pantalla
      });
    }
  }, 50);
}
}
