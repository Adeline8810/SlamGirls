import { Component } from '@angular/core';
import { AudioKaraokeService } from '../../../services/audio-karaoke.service';

@Component({
  selector: 'app-cantar',
  templateUrl: './cantar.html',
  styleUrls: ['./cantar.css']
})
export class Cantar {
  grabando: boolean = false;
  letraActual: string = 'Presiona comenzar para iniciar...';
  letraSiguiente: string = '';

  constructor(private audioService: AudioKaraokeService) {}

  // 1. Iniciar la magia
async iniciar() {
    try {
      this.grabando = true; // El botón debería cambiar a "Finalizar" de inmediato
      await this.audioService.iniciarGrabacionConEfecto();
    } catch (error) {
      console.error("Error al iniciar:", error);
      this.grabando = false; // Si falla el micro, volvemos al estado inicial
      alert("No se pudo acceder al micrófono.");
    }
  }

  async finalizarCanto() {
    try {
      const idUsuario = Number(localStorage.getItem('usuarioId'));
      const peticion = await this.audioService.detenerYEnviarAlServidor(idUsuario);

      peticion.subscribe({
        next: (res) => {
          alert("¡Guardado en tu perfil!");
          this.grabando = false; // Volvemos al estado "Comenzar" tras el éxito
        },
        error: (err) => {
          console.error(err);
          this.grabando = false;
        }
      });
    } catch (error) {
      this.grabando = false;
    }
  }
}
