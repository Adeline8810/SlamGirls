import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UsuarioService } from '../../../services/usuario.service';
import { RespuestaService } from '../../../services/respuesta.service';
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
  selectedTab: string = 'videos';
  videoSeleccionado = signal<any>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private respuestaService: RespuestaService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.usuarioService.obtenerDetallesUsuario(username).subscribe({
        next: (res: any) => {
          // CORRECCIÓN: Manejo robusto de la respuesta para evitar error .find
          let encontrado = null;
          if (Array.isArray(res)) {
            encontrado = res.find((u: any) => u.username === username);
          } else if (res && (res.username === username || res.id)) {
            encontrado = res;
          }

          if (encontrado) {
            this.usuario.set(encontrado);
            this.cargarVideos(encontrado.id);
          }
        },
        error: (err) => console.error("Error al obtener perfil", err)
      });
    }
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  cargarVideos(userId: number) {
    this.respuestaService.obtenerVideos(userId).subscribe(res => {
      this.videos = res;
    });
  }

  verVideo(video: any) {
    // Esto activa el componente app-video-detail
    this.videoSeleccionado.set(video);
  }

  volver() { this.router.navigate(['/buscar-usuario']); }


irAlChat() {
  this.router.navigate(['/chat', this.usuario().username]);
}

}
