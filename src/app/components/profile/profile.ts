import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  // Variables de identidad
  usuarioId: number = 123;
  usuarioActual = { username: 'ruth' };
  fotoUrlServidor: string = 'assets/img/ruth_slam.jpg'; // URL de la foto cargada

  // Objeto de la corona (integrado de tu módulo tienda)
  objetoSeleccionado: any = null;

  // Lista de videos con duración (como en la imagen)
  misVideos = [
    { id: 1, thumb: 'assets/v1.jpg', duration: '00:00' },
    { id: 2, thumb: 'assets/v2.jpg', duration: '00:30' },
    { id: 3, thumb: 'assets/v3.jpg', duration: '00:30' },
    { id: 4, thumb: 'assets/v4.jpg', duration: '00:30' }
  ];

  constructor() {}

  ngOnInit(): void {}

  // Lógica para las coronas (ajuste que hicimos antes)
  obtenerEscala(id: number): string {
    if (id === 8 || id === 9) return 'scale(0.85) translateY(-3%)';
    return 'scale(1.1)';
  }

  irA(seccion: string) {
    console.log('Navegando a:', seccion);
  }

  verVideo(video: any) {
    // Aquí abrirás el reproductor con opción de regalos
    console.log('Reproduciendo video:', video.id);
  }
}
