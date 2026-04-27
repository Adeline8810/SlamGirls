import { Component, OnInit , signal} from '@angular/core';
import { RespuestaService } from '../../../services/respuesta.service'; // Ajusta la ruta a tu proyecto
import { UsuarioService } from '../../../services/usuario.service';
import { VideoDetail } from '../../components/video-detail/video-detail';
import { CommonModule } from '@angular/common';
interface Video {
  id: number;
  titulo: string;
  urlVideo?: string;
  thumbnail?: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true, // <--- ESTO ES IMPORTANTE EN ANGULAR 20
  imports: [VideoDetail, CommonModule] // <--- Ahora ya no debería estar en rojo
})
export class Profile implements OnInit {
  selectedTab: string = 'videos'; // Por defecto en videos como pediste
  usuarioActual: any = {}; // ✅ Declarado para que el HTML no de error
  videos: any[] = []; // Aquí guardaremos los videos de la DB
  cargandoVideo: boolean = false;

  // VARIABLES REALES (Igual que en tu Slam)
  usuarioId!: number;
  nombreUsuario: string = '';

  fotoUrlServidor: string = 'assets/img/default.png'; // Imagen por defecto inicial
  videoSeleccionado = signal<any>(null);

  constructor(private respuestaService: RespuestaService,private usuarioService: UsuarioService,) {}

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

  verVideo(video: any) {
    this.videoSeleccionado.set(video); // Esto le dice al Signal qué video mostrar
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

  // 1. Mostrar vista previa inmediata en el navegador
  const reader = new FileReader();
  reader.onload = (e) => {
    this.fotoUrlServidor = (e.target as any).result;
  };
  reader.readAsDataURL(f);

  // 2. Preparar el ID del usuario
  const idParaSubir = this.usuarioId.toString();

  // 3. Llamada al servicio de USUARIOS (no de respuestas)
  this.usuarioService.subirFotoPerfil(f, idParaSubir).subscribe({
    next: (urlCloudinary: string) => {
      // ✅ Guardamos la URL real que nos devolvió el servidor
      this.fotoUrlServidor = urlCloudinary;

      // Actualizamos el objeto del usuario en memoria para que el HTML se refresque
      if (this.usuarioActual) {
        this.usuarioActual.fotoUrl = urlCloudinary;
      }

      // Guardamos en el almacenamiento local para persistencia
      localStorage.setItem('user_foto_perfil', urlCloudinary);

      console.log("¡Éxito! Foto vinculada al usuario en la base de datos.");
      alert('Foto de perfil actualizada correctamente.');
    },
    error: (err) => {
      console.error('Error detallado:', err);

      // Manejo de errores basado en la realidad del servidor
      if (err.status === 413) {
        alert('Error: La imagen es demasiado pesada para el servidor (Límite excedido).');
      } else if (err.status === 404) {
        alert('Error: No se encontró el usuario en la base de datos.');
      } else {
        alert('Error al subir la foto. Por favor, revisa la consola o los logs de Render.');
      }
    }
  });
}

onVideoSeleccionado(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const pesoEnMB = file.size / 1024 / 1024;
  if (pesoEnMB > 50) {
    alert(`El video es muy pesado (${pesoEnMB.toFixed(2)}MB). Máximo permitido: 50MB`);
    return;
  }

  const idSeguro = this.usuarioId ? this.usuarioId.toString() : "1";

  this.cargandoVideo = true; // <-- 2. Activar reloj
  console.log("Subiendo video...");

  this.respuestaService.subirVideo(file, idSeguro).subscribe({
    next: (res) => {
      // 3. Forzar refresco de URL para que el video abra siempre
      res.urlVideo = res.urlVideo + '?t=' + Date.now();

      this.videos.unshift(res);
      this.cargandoVideo = false; // <-- 4. Desactivar reloj
      alert("¡Video subido con éxito!");
    },
    error: (err) => {
      this.cargandoVideo = false;
      alert("Error en el servidor");
    }
  });
}
  changeTab(tab: string) {
    this.selectedTab = tab;
  }
}
