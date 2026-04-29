import { Component,ViewChild,ElementRef, OnInit } from '@angular/core';
import { AudioKaraokeService } from '../../../services/audio-karaoke.service';
import { CommonModule } from '@angular/common';


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


  constructor(private audioService: AudioKaraokeService) {}

  ngOnInit() {
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
    } catch (error) {
      this.cargandoSubida = false;
      console.error("Error:", error);
    }
  }

cargarMisCovers() {
    const idUsuario = Number(localStorage.getItem('usuarioId'));
    if (idUsuario) {
      this.audioService.obtenerMisCantos(idUsuario).subscribe(data => {
        this.listaDeCantos = data;
      });
    }
  }
}
