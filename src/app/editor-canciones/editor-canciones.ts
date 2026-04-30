import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-editor-canciones',
  templateUrl: './editor-canciones.html',
  styleUrls: ['./editor-canciones.css']
})
export class EditorCanciones {
  @ViewChild('pistaAudio') pistaAudio!: ElementRef<HTMLAudioElement>;

  // --- VARIABLES DE CARGA INICIAL ---
  letraPlana: string = ''; // Almacena el texto pegado del textarea
  audioUrl: string | null = null; // URL temporal para reproducir el archivo seleccionado
  archivoSeleccionado: File | null = null; // El archivo .mp3 físico
  tituloCancion: string = ''; // Nombre de la canción
  artistaCancion: string = ''; // Nombre del artista (Jamendo/CC)

  // --- VARIABLES DE ESTADO DEL FLUJO ---
  pasoEditor: number = 1; // 1: Carga, 2: Sincronización, 3: Revisión/Subida
  musicaIniciada: boolean = false;
  estaSincronizando: boolean = false;

  // --- VARIABLES DE LA LÓGICA DE TIEMPOS ---
  // Este array guardará los objetos finales { texto: string, tiempo: number }
  lineasParaSincronizar: any[] = [];
  indiceSincronizacion: number = 0; // Controla qué línea toca marcar ahora

  // --- VARIABLES DE INTERFAZ ---
  errorEditor: string | null = null;
  cargandoServidor: boolean = false;

  constructor(private http: HttpClient) {}

  // --- MÉTODOS LÓGICOS ---

  // Paso 1: Preparar los datos
  cargarArchivo(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.audioUrl = URL.createObjectURL(file); // Crea ruta local para el <audio>
    }
  }

  comenzarSincronizacion() {
    if (!this.letraPlana.trim() || !this.archivoSeleccionado) {
      alert("Por favor, pega la letra y selecciona un audio.");
      return;
    }

    // Convertimos el texto plano en array de objetos
    this.lineasParaSincronizar = this.letraPlana
      .split('\n')
      .filter(linea => linea.trim() !== '') // Quitamos líneas vacías
      .map(linea => ({
        texto: linea.trim(),
        tiempo: 0
      }));

    this.pasoEditor = 2;
    this.musicaIniciada = true;

    // Pequeño delay para que el usuario se prepare antes de que suene
    setTimeout(() => {
      this.pistaAudio.nativeElement.play();
    }, 1000);
  }

  // Paso 2: El sistema de "TAP" (Marcar tiempo)
  marcarTiempo() {
    const audio = this.pistaAudio.nativeElement;

    if (this.indiceSincronizacion < this.lineasParaSincronizar.length) {
      // Asignamos el segundo actual de la música a la frase actual
      this.lineasParaSincronizar[this.indiceSincronizacion].tiempo = audio.currentTime;

      console.log(`Marcado: ${this.lineasParaSincronizar[this.indiceSincronizacion].texto} a los ${audio.currentTime}s`);

      this.indiceSincronizacion++;
    }

    // Si terminamos todas las líneas
    if (this.indiceSincronizacion >= this.lineasParaSincronizar.length) {
      this.finalizarSincronizacion();
    }
  }

  finalizarSincronizacion() {
    this.musicaIniciada = false;
    this.pistaAudio.nativeElement.pause();
    this.pasoEditor = 3; // Vamos a la pantalla de guardar
  }

  // Paso 3: Guardar todo (Cloudinary + Tu Backend)
  async guardarCancionEnSistema() {
    this.cargandoServidor = true;

    // Aquí crearías un FormData
    const formData = new FormData();
    formData.append('audio', this.archivoSeleccionado!);
    formData.append('titulo', this.tituloCancion);
    formData.append('artista', this.artistaCancion);
    // Convertimos el array de letras a String JSON para que el servidor lo entienda
    formData.append('letra_json', JSON.stringify(this.lineasParaSincronizar));

    // Ejemplo de envío a tu API en Render
    this.http.post('https://tu-backend.onrender.com/api/canciones/nueva', formData)
      .subscribe({
        next: (res) => {
          alert("¡Canción guardada con éxito!");
          this.cargandoServidor = false;
        },
        error: (err) => {
          this.cargandoServidor = false;
          console.error(err);
        }
      });
  }
}
