import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TraduccionService } from '../../../services/traduccion.service';
import { RespuestaService } from '../../../services/respuesta.service'; // Para los videos
import { VideoDetail } from '../../components/video-detail/video-detail';

@Component({
  selector: 'app-perfil-ajeno',
  standalone: true,
  imports: [CommonModule, VideoDetail],
  templateUrl: './perfil-ajeno.html',
  styleUrl: './perfil-ajeno.css'
})
export class PerfilAjeno implements OnInit {
  usuario = signal<any>(null);
  videos: any[] = [];
  selectedTab: string = 'videos'; // Empezamos en videos como en tu perfil
  videoSeleccionado = signal<any>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private miServicio: TraduccionService,
    private respuestaService: RespuestaService
  ) {}

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.miServicio.buscarUsuarios(username).subscribe(res => {
        const encontrado = res.find((u: any) => u.username === username);
        if (encontrado) {
          this.usuario.set(encontrado);
          this.cargarVideos(encontrado.id); // Cargar videos del usuario ajeno
        }
      });
    }
  }

  cargarVideos(userId: number) {
    this.respuestaService.obtenerVideos(userId).subscribe(res => {
      this.videos = res;
    });
  }

  verVideo(video: any) {
    this.videoSeleccionado.set(video);
  }

  volver() { this.router.navigate(['/buscar-usuario']); }
  irAlChat() { /* Tu lógica futura */ }
}
