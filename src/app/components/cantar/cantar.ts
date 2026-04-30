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

  @ViewChild('pistaAudio') pistaAudio!: ElementRef<HTMLAudioElement>;


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


ngAfterViewInit() {
  if (this.cancionSeleccionada) {
    this.pistaAudio.nativeElement.src = this.cancionSeleccionada.url_pista;
    this.pistaAudio.nativeElement.load();
  }
}

async iniciar() {
  // 1. Validamos que el elemento existe con el nombre correcto (#pistaAudio)
  const audioEl = this.pistaAudio?.nativeElement;

  if (!audioEl) {
    console.error("No se encontró el elemento audio en el HTML. Revisa que el ID sea #pistaAudio");
    return;
  }

  try {
    // 2. Cambiamos el estado visual ANTES de la promesa para evitar retrasos en la UI
    this.grabando = true;
    this.pasoActual = 1; // Nos aseguramos de estar en la pantalla de letras

    // 3. Iniciamos la lógica del servicio
    // Nota: Usamos audioEl que ya validamos arriba
    await this.audioService.iniciarGrabacionConPista(audioEl);

    console.log("Grabación iniciada correctamente");
  } catch (error) {
    console.error("Error al iniciar:", error);
    this.grabando = false;
    alert("No se pudo acceder al micrófono o a la pista de audio.");
  }
}

 // 4. FINALIZAR: Detenemos la música y el eco
  async finalizarCanto() {
  this.grabando = false;

  // 1. Detener la música físicamente (usando tu referencia 'pista')
  if (this.pista) {
    this.pista.nativeElement.pause();
    this.pista.nativeElement.currentTime = 0;
  }

  // 2. Detener eco y micrófono
  this.audioService.detenerFlujoAudio();

  // 3. Cambiamos al paso de edición (Sliders de volumen y efectos)
  // Aquí NO activamos cargandoSubida porque el usuario aún debe editar
  this.pasoActual = 2;
  console.log("Canto finalizado. Pasando a edición de volúmenes.");
}


async publicarTodo() {
  this.cargandoSubida = true; // Aquí sí mostramos el spinner de carga

  try {
    const idUsuario = Number(localStorage.getItem('usuarioId'));
    if (!idUsuario) {
      alert("Inicia sesión de nuevo.");
      this.cargandoSubida = false;
      return;
    }

    // Usamos el método que ya tienes en tu servicio
    const peticion = await this.audioService.detenerYEnviarAlServidor(idUsuario);

    peticion.subscribe({
      next: (res) => {
        this.cargandoSubida = false;
        alert("¡Tu cover se ha publicado con éxito! 🎤");
        this.cargarMisCovers();
        this.pasoActual = 1; // Opcional: resetear al inicio o redirigir
      },
      error: (err) => {
        this.cargandoSubida = false;
        console.error("Error al subir:", err);
        alert("Error al guardar en el servidor.");
      }
    });

  } catch (error) {
    this.cargandoSubida = false;
    console.error("Error en la publicación:", error);
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
