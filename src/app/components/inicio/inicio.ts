import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Importa Router
import { LiveService } from '../../../services/live.service';
import { VideoService } from '../../../services/video.service';
import { LivekitService } from '../../../services/livekit.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio implements OnInit {
  listaLives: any[] = [];
  listaVideos: any[] = [];

  // --- DATOS DINÁMICOS DEL LOGIN ---
  // Obtenemos los datos que guardaste en el localStorage al loguearte
  usuarioId: string = localStorage.getItem('usuarioId') || '0';
  usuarioNombre: string = localStorage.getItem('usuarioNombre') || 'Invitado';

  private liveService = inject(LiveService);
  private videoService = inject(VideoService);
  private livekitService = inject(LivekitService); // Inyectamos tu nuevo servicio
  private router = inject(Router); // Para navegar programáticamente

  ngOnInit() {
    // Cargar lives activos para los círculos
    this.livekitService.getLivesActivos().subscribe(data => {
      this.listaLives = data;
    });

    // Cargar videos normales
    this.videoService.obtenerTodosLosVideos().subscribe(data => {
      this.listaVideos = data;
    });
  }

  /**
   * Método para el botón "+"
   * Usa los datos reales del usuario logueado
   */
  iniciarMiLive() {
    if (this.usuarioId === '0') {
      alert("Debes iniciar sesión para transmitir");
      return;
    }

    const payload = {
      usuarioId: Number(this.usuarioId),
      titulo: `Live de ${this.usuarioNombre}`
    };

    // 1. Registramos el live en Spring Boot
    this.livekitService.iniciarLiveEnDB(payload).subscribe({
      next: (res) => {
        // 2. Saltamos a la sala de video con los datos reales
        this.router.navigate(['/videoSala'], {
          queryParams: {
            sala: res.streamKey,
            usuario: this.usuarioNombre,
            modo: 'streamer'
          }
        });
      },
      error: (err) => console.error('Error al crear live:', err)
    });
  }
}
