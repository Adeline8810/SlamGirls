import { Component } from '@angular/core';
import { PreguntaService } from '../../../services/pregunta.service';
import { RespuestaService } from '../../../services/respuesta.service';
import { TraduccionService } from '../../../services/traduccion.service';
import { Pregunta } from '../../../models/pregunta';
import { Respuesta } from '../../../models/respuesta';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  misFotos: string[] = [];
  seguidores = 7900;
  seguidos = 743;
  regalos = 40500;
  usuarioId: number = 123; // El ID que corresponda

  // AÑADE ESTA LÍNEA PARA QUITAR EL ERROR ROJO:
  usuarioActual = { username: 'ruth' };

   constructor( private respuestaService: RespuestaService,private traduccionService: TraduccionService) {


      }

  onSubirMedia(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Aquí usarías tu servicio de subirFoto que ya creamos para el Slam
      this.respuestaService.subirFoto(file, this.usuarioId.toString()).subscribe({
        next: (path) => {
          const urlCompleta = `https://backend-ruth-slam.onrender.com/${path}`;
          this.misFotos.unshift(urlCompleta); // Añade la foto al principio del carrusel
        }
      });
    }
  }

  irA(ruta: string) {
    // Lógica para navegar a tienda, quiz, etc.
  }
}
