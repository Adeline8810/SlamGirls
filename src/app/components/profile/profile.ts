import { Component, OnInit } from '@angular/core';
import { RespuestaService } from '../../../services/respuesta.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  // Datos del usuario
  usuarioId: number = 123;
  usuarioActual = { username: 'ruth' };
  fotoUrlServidor: string = 'assets/ruth-profile.jpg'; // Foto que viene del Slam

  // Listas de contenido
  misFotos: string[] = []; // Fotos para el carrusel superior
  misVideos: any[] = [
    { thumbnail: 'assets/v1.jpg', duration: '00:30', url: 'vid1.mp4' },
    { thumbnail: 'assets/v2.jpg', duration: '00:15', url: 'vid2.mp4' }
  ];

  // Corona activa (la que arreglamos en el módulo tienda)
  coronaActiva: any = null;

  constructor(private respuestaService: RespuestaService) {}

  ngOnInit() {
    // Aquí cargarías los datos iniciales del usuario
  }

  irA(ruta: string) {
    console.log('Navegando a:', ruta);
    // Lógica de navegación
  }

  reproducir(video: any) {
    console.log('Abriendo reproductor para:', video.url);
    // Aquí abrirías la pantalla tipo StarMaker con el botón de regalos
  }
}
