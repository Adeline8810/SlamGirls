import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
selector: 'app-editor-canciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule  // <--- Y REGÍSTRALO AQUÍ
  ],
  templateUrl: './editor-canciones.html',
  styleUrls: ['./editor-canciones.css']
})
export class EditorCanciones {
  letraBruta: string = '';
  audioNombre: string = '';
  paso: number = 1;
  frases: any[] = [];
  indiceFrase: number = 0;
  tiempoInicio: number = 0;
  estaSincronizando: boolean = false;
  audioElement: HTMLAudioElement | null = null;

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

onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.audioNombre = file.name;

    // Crear el objeto de audio si no existe
    if (!this.audioElement) {
      this.audioElement = new Audio();
    }

    // Crear una URL temporal para el archivo seleccionado
    const url = URL.createObjectURL(file);
    this.audioElement.src = url;
    this.audioElement.load();

    console.log("Audio cargado y listo para sonar");
  }
}

irASincronizar() {
if (!this.letraBruta || !this.audioNombre) {
    alert("Faltan datos");
    return;
  }

  // 1. Convertir el texto en un array de objetos
  this.frases = this.letraBruta.split('\n')
    .filter(linea => linea.trim() !== '')
    .map(linea => ({ texto: linea.trim(), tiempo: 0 }));

  // 2. Cambiar al paso 2
  this.paso = 2;


}

comenzarTap() {
if (!this.audioElement) {
    alert("Primero selecciona un archivo de audio");
    return;
  }

  this.estaSincronizando = true;
  this.indiceFrase = 0;

  // Reiniciar el audio al principio y sonar
  this.audioElement.currentTime = 0;
  this.audioElement.play().catch(error => {
    console.error("Error al reproducir audio:", error);
    alert("Haz clic en la pantalla antes de iniciar para permitir el audio");
  });
}

marcarTiempo() {
  if (!this.estaSincronizando || !this.audioElement) return;

  const tiempoActual = this.audioElement.currentTime;

  // Guardamos el tiempo en el array de frases
  if (this.indiceFrase < this.frases.length) {
    this.frases[this.indiceFrase].tiempo = tiempoActual;
    console.log(`Marcado: ${this.frases[this.indiceFrase].texto} -> ${tiempoActual}s`);
    this.indiceFrase++;
  }

  // Si terminamos, detenemos el audio
  if (this.indiceFrase >= this.frases.length) {
    this.audioElement.pause();
    this.estaSincronizando = false;
    alert("¡Sincronización terminada! Ya puedes generar el JSON.");
  }
}


}
