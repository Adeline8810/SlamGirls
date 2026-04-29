import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AudioKaraokeService } from '../../../services/audio-karaoke.service'; // Ajusta la ruta si es necesario
import { RouterModule } from '@angular/router';


interface Letra {
  tiempo: number;
  texto: string;
}

@Component({
  selector: 'app-cantar',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './cantar.html',
  styleUrls: ['./cantar.css']
})
export class Cantar implements OnInit, OnDestroy {

  // 1. Estado de la canción y letras
  letras: Letra[] = [
    { tiempo: 0, texto: "🎤 Prepárate para brillar..." },
    { tiempo: 5, texto: "Si no te hubiera conocido..." },
    { tiempo: 10, texto: "No sé qué sería de mí..." },
    { tiempo: 15, texto: "Toda mi vida cambió por ti..." }
  ];

  fraseActual = signal("¡Listos!");
  tiempoActual = 0;
  grabando = signal(false);
  intervaloLetras: any;

  // Reemplaza con el ID real del usuario (puedes traerlo de tu AuthService)
  usuarioId = 18;

  constructor(
    private audioService: AudioKaraokeService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {}

  // 2. Lógica para iniciar el show
  async empezarCantar() {
    this.grabando.set(true);
    this.tiempoActual = 0;

    // Iniciamos el servicio de audio con efectos
    await this.audioService.iniciarGrabacionConEfecto();

    // Iniciamos el cronómetro para las letras
    this.intervaloLetras = setInterval(() => {
      this.tiempoActual++;
      this.actualizarLetra();
    }, 1000);
  }

  actualizarLetra() {
    // Buscamos la frase que corresponde al segundo actual
    const encontrada = this.letras.find(l => l.tiempo === this.tiempoActual);
    if (encontrada) {
      this.fraseActual.set(encontrada.texto);
    }
  }

  // 3. Detener y subir a Spring Boot
  async finalizarCanto() {
    this.grabando.set(false);
    clearInterval(this.intervaloLetras);

    // Obtenemos el archivo de audio (Blob)
    const audioBlob = await this.audioService.detenerYObtenerAudio();

    this.subirAlServidor(audioBlob);
  }

  subirAlServidor(blob: Blob) {
    const formData = new FormData();
    // El nombre "file" debe coincidir con @RequestParam("file") en tu CantoController de Java
    formData.append('file', blob, 'mi_canto.wav');
    formData.append('usuarioId', this.usuarioId.toString());

    console.log("Subiendo canto a la nube...");

    this.http.post('https://tu-api-en-render.com/api/canto/subir', formData)
      .subscribe({
        next: (res) => alert("¡Grabación guardada con éxito!"),
        error: (err) => console.error("Error al subir", err)
      });
  }

  ngOnDestroy(): void {
    if (this.intervaloLetras) clearInterval(this.intervaloLetras);
  }
}
