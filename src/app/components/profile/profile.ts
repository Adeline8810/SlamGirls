import { Component, OnInit } from '@angular/core';
import { RespuestaService } from '../../../services/respuesta.service'; // Ajusta la ruta a tu proyecto

interface Video {
  id: number;
  thumbnail: string;
  title: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  selectedTab: string = 'videos'; // Por defecto en videos como pediste
  videos: Video[] = [];

  // VARIABLES REALES (Igual que en tu Slam)
  usuarioId!: number;
  nombreUsuario: string = '';
  usuarioActual: any;
  fotoUrlServidor: string = 'assets/img/default.png'; // Imagen por defecto inicial

  constructor(private respuestaService: RespuestaService) {}

  ngOnInit(): void {
    // 1. OBTENER USUARIO LOGUEADO (Igual que en tu Slam)
    const u = localStorage.getItem('usuario');
    if (!u) {
      alert('Debes iniciar sesión');
      return;
    }

    const usuarioObj = JSON.parse(u);
    this.usuarioActual = usuarioObj;
    this.usuarioId = usuarioObj.id;
    this.nombreUsuario = usuarioObj.nombre;

    // 2. CARGAR FOTO (Prioridad LocalStorage para rapidez, luego podrías pedir a BD)
    const fotoGuardada = localStorage.getItem('user_foto_perfil');
    if (fotoGuardada) {
      this.fotoUrlServidor = fotoGuardada;
    }

    // Carga de videos (placeholder por ahora)
    this.videos = [
      { id: 1, thumbnail: 'https://via.placeholder.com/150', title: 'Video 1' },
      { id: 2, thumbnail: 'https://via.placeholder.com/150', title: 'Video 2' }
    ];
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

  changeTab(tab: string) {
    this.selectedTab = tab;
  }
}
