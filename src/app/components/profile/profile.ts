import { Component, OnInit } from '@angular/core';
import { RespuestaService } from '../../../services/respuesta.service'; // Ajusta la ruta a tu proyecto

interface Video {
  id: number;
  titulo: string;
  urlVideo?: string;
  thumbnail?: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  selectedTab: string = 'videos'; // Por defecto en videos como pediste
  usuarioActual: any = {}; // ✅ Declarado para que el HTML no de error
  videos: any[] = []; // Aquí guardaremos los videos de la DB

  // VARIABLES REALES (Igual que en tu Slam)
  usuarioId!: number;
  nombreUsuario: string = '';

  fotoUrlServidor: string = 'assets/img/default.png'; // Imagen por defecto inicial

  constructor(private respuestaService: RespuestaService) {}

 ngOnInit(): void {
    const u = localStorage.getItem('usuario');
    if (u) {
      this.usuarioActual = JSON.parse(u);
      this.usuarioId = this.usuarioActual.id;

      // ✅ Cargar videos reales del usuario al entrar
      this.respuestaService.obtenerVideos(this.usuarioId).subscribe(res => {
        this.videos = res;
      });
    }
  }

  onSubirMedia(event: any) {
    const file = event.target.files[0];
    if (file && this.usuarioId) {
      // ✅ .toString() para arreglar el error de la imagen
      this.respuestaService.subirVideo(file, this.usuarioId.toString()).subscribe({
        next: (nuevoVideo) => {
          this.videos.unshift(nuevoVideo); // Lo añade a la vista inmediatamente
          console.log("Video guardado en tabla 'videos'");
        }
      });
    }
  }


  // MÉTODO EDITAR/SUBIR FOTO (Copiado de tu lógica de Slam)
  onFotoSeleccionada(ev: any) {
    const f: File = ev.target.files && ev.target.files[0];
    if (!f) return;

    // Vista previa inmediata
    const reader = new FileReader();
    reader.onload = (e) => {
      this.fotoUrlServidor = (e.target as any).result;
    };
    reader.readAsDataURL(f);

    // Subida al servidor usando tu servicio
    const idParaSubir = this.usuarioId.toString();
    this.respuestaService.subirFoto(f, idParaSubir).subscribe({
      next: (pathRelativo) => {
        const baseApi = 'https://backend-ruth-slam.onrender.com';
        const cleanPath = pathRelativo.startsWith('/') ? pathRelativo : '/' + pathRelativo;
        const urlFinal = `${baseApi}${cleanPath}?v=${new Date().getTime()}`;

        this.fotoUrlServidor = urlFinal;
        if(this.usuarioActual) this.usuarioActual.avatarUrl = urlFinal;

        localStorage.setItem('user_foto_perfil', urlFinal);
        console.log("Foto de perfil actualizada en Profile:", urlFinal);
      },
      error: (err) => {
        console.error('Error al subir foto:', err);
        alert('No se pudo actualizar la foto');
      }
    });
  }

onVideoSeleccionado(event: any) {
  const file = event.target.files[0];
  if (file && this.usuarioId) {
    this.respuestaService.subirVideo(file, this.usuarioId.toString()).subscribe({
      next: (res) => {
        // 'res' ya es un objeto Video con urlVideo y titulo que viene de Java
        this.videos.unshift(res);
        console.log("Video cargado con éxito");
      },
      error: (err) => alert("Error al subir el video")
    });
  }
}
  changeTab(tab: string) {
    this.selectedTab = tab;
  }
}
