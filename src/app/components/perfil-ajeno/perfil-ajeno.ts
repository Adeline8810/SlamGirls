import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UsuarioService } from '../../../services/usuario.service'; // 👈 Tu servicio real
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
    private usuarioService: UsuarioService, // 👈 Usamos tu UsuarioService
    private respuestaService: RespuestaService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      // 👈 Usamos TU método: obtenerDetallesUsuario
      this.usuarioService.obtenerDetallesUsuario(username).subscribe({
        next: (res: any) => {
          // Como este endpoint (/perfil/${username}) suele devolver el objeto directo:
          if (res) {
            this.usuario.set(res);
            this.cargarVideos(res.id);
          }
        },
        error: (err) => console.error("Error al obtener perfil", err)
      });
    }
  }

  // Desbloquea el video para que no se vea blanco/bloqueado
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  cargarVideos(userId: number) {
    this.respuestaService.obtenerVideos(userId).subscribe(res => {
      this.videos = res;
    });
  }

  verVideo(video: any) {
    this.videoSeleccionado.set(video); // Esto abre el detalle para dar REGALOS
  }

  volver() { this.router.navigate(['/buscar-usuario']); }
}
