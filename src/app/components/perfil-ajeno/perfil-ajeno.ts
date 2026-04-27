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
  // 1. Obtenemos el nombre del usuario de la URL (Adeline)
  const username = this.route.snapshot.paramMap.get('username');

  if (username) {
    console.log("Buscando a:", username);

    // 2. Llamamos al servicio de búsqueda
    this.miServicio.buscarUsuarios(username).subscribe({
      next: (res : any) => {
        console.log("Respuesta cruda del servidor:", res);

        // --- EL ARREGLO ESTÁ AQUÍ ---

        let encontrado = null;

        // Caso A: El servidor devuelve una lista (como esperábamos antes)
        if (Array.isArray(res)) {
          encontrado = res.find((u: any) => u.username === username);
        }
        // Caso B: El servidor devuelve directamente el objeto del usuario (lo más probable)
        else if (res && typeof res === 'object' && res.username === username) {
          encontrado = res;
        }

        // 3. Si encontramos al usuario, lo cargamos
        if (encontrado) {
          console.log("Usuario encontrado y cargado:", encontrado);
          this.usuario.set(encontrado);

          // Importante: Asegúrate de tener el ID para cargar los videos
          if (encontrado.id) {
            this.cargarVideos(encontrado.id);
          }
        } else {
          console.warn("No se encontró a nadie con el usuario:", username);
          // Opcional: Redirigir a una página de error o mostrar mensaje
        }
      },
      error: (err) => {
        // Por si acaso el servidor falla totalmente
        console.error("Error en la petición al servidor:", err);
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
