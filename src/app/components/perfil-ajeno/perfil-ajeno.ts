import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TraduccionService } from '../../../services/traduccion.service';
import { RespuestaService } from '../../../services/respuesta.service';
import { VideoDetail } from '../../components/video-detail/video-detail';
import { UsuarioService } from '../../../services/usuario.service';

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

  // Variable para asegurar que siempre haya una foto por defecto si el servidor no devuelve nada
  defaultAvatar: string = 'assets/img/default.png';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private miServicio: TraduccionService,
    private usuarioService: UsuarioService,
    private respuestaService: RespuestaService
  ) {}

  ngOnInit() {
    // 1. Obtener el username de la URL
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      console.log("Buscando a:", username);
      this.usuarioService.obtenerDetallesUsuario(username).subscribe(res => {
        // Encontramos el usuario exacto en la búsqueda
        const encontrado = res.find((u: any) => u.username === username);
       if (encontrado) {
          // Si tiene foto, le sumamos un número al final para que el navegador la recargue de verdad
          if (encontrado.fotoUrl) {
            encontrado.fotoUrl = encontrado.fotoUrl + '?t=' + Date.now();
          }

          this.usuario.set(encontrado);
          this.cargarVideos(encontrado.id);
          console.log("Foto de Adeline cargada:", encontrado.fotoUrl);
        } else {
          console.error("Usuario no encontrado en la búsqueda");
          // Podrías redirigir a una página de 404
        }
      });
    }
  }

  cargarVideos(userId: number) {
    this.respuestaService.obtenerVideos(userId).subscribe(res => {
      // Forzamos un refresco de caché para los videos, igual que en tu perfil
      this.videos = res.map((v: any) => ({
        ...v,
        urlVideo: v.urlVideo + '?t=' + Date.now()
      }));
    });
  }

  verVideo(video: any) {
    this.videoSeleccionado.set(video);
  }

  volver() { this.router.navigate(['/buscar-usuario']); }
  irAlChat() { /* Tu lógica futura */ }
}
