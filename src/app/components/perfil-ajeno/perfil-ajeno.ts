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
  selectedTab: string = 'videos'; // Pestaña por defecto
  videoSeleccionado = signal<any>(null); // Para el modal de detalle

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

changeTab(tab: string) {
  this.selectedTab = tab;
}

verVideo(video: any) {
  // Aquí es donde guardamos el video para mostrarlo con opciones
  this.videoSeleccionado.set(video);
}

irAlChat() {
  // 1. Accedemos al valor de la señal usando ()
  // 2. Usamos 'username' que es lo que validaste en el ngOnInit
  const usuarioData = this.usuario();

  if (usuarioData && usuarioData.username) {
    this.router.navigate(['/chat', usuarioData.username]);
  } else {
    console.error("No se puede redirigir: faltan datos del usuario");
  }
}


}
