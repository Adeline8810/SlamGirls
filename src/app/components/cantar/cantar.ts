import { Component } from '@angular/core';
import { AudioKaraokeService } from '../../../services/audio-karaoke.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-cantar',
  imports: [CommonModule],
  templateUrl: './cantar.html',
  styleUrls: ['./cantar.css']
})
export class Cantar {
  grabando: boolean = false;
  cargandoSubida: boolean = false;
  letraActual: string = 'Presiona comenzar para iniciar...';
  letraSiguiente: string = '';
  listaDeCantos: any[] = [];


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
  this.cargandoSubida = true;

  try {
    // CAMBIA ESTO:
    // const idUsuario = 1;

    // POR ESTO (Recupera el ID real del que inició sesión):
    const idUsuario = Number(localStorage.getItem('usuarioId'));

    if (!idUsuario) {
      alert("No se encontró el ID del usuario. Por favor, inicia sesión de nuevo.");
      this.cargandoSubida = false;
      return;
    }

    const peticion = await this.audioService.detenerYEnviarAlServidor(idUsuario);

    peticion.subscribe({
      next: (res) => {
      this.grabando = false;
      this.cargandoSubida = false;
      alert("¡Guardado en tu perfil!");

      // AÑADE ESTA LÍNEA AQUÍ:
      this.cargarMisCovers();
    },
      error: (err) => {
        this.cargandoSubida = false;
        this.grabando = false;
        console.error("Error al subir:", err);
      }
    });
  } catch (error) {
    this.cargandoSubida = false;
    this.grabando = false;
    console.error("Error en el proceso:", error);
  }
}

cargarMisCovers() {
  // RECUPERA EL ID REAL DEL STORAGE (Ya no usamos el 1 fijo)
  const idUsuario = Number(localStorage.getItem('usuarioId'));

  if (idUsuario) {
    this.audioService.obtenerMisCantos(idUsuario).subscribe({
      next: (data) => {
        this.listaDeCantos = data;
      },
      error: (err) => console.error("Error al cargar covers:", err)
    });
  } else {
    console.warn("No se encontró usuarioId en el storage.");
  }
}
}
