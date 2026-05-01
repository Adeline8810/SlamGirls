import { Component, OnInit , signal} from '@angular/core';
import { RespuestaService } from '../../../services/respuesta.service'; // Ajusta la ruta a tu proyecto
import { UsuarioService } from '../../../services/usuario.service';
import { AudioKaraokeService  } from '../../../services/audio-karaoke.service';

import { VideoDetail } from '../../components/video-detail/video-detail';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  imports: [VideoDetail, CommonModule,RouterModule] // <--- Ahora ya no debería estar en rojo
})
export class Profile implements OnInit {
  selectedTab: string = 'videos'; // Por defecto en videos como pediste
  usuarioActual: any = {}; // ✅ Declarado para que el HTML no de error
  videos: any[] = []; // Aquí guardaremos los videos de la DB
  misCantos: any[] = [];
  cargandoVideo: boolean = false;
  cargandoFoto: boolean = false;

  // VARIABLES REALES (Igual que en tu Slam)
  usuarioId!: number;
  nombreUsuario: string = '';
  perfilInfo: any = null;

  fotoUrlServidor: string = 'assets/img/default.png'; // Imagen por defecto inicial
  videoSeleccionado = signal<any>(null);
  reproductorActual: HTMLAudioElement | null = null;

  constructor(private respuestaService: RespuestaService,private usuarioService: UsuarioService,private audioService: AudioKaraokeService) {}

 ngOnInit(): void {
  const u = localStorage.getItem('usuario');
  if (u) {
    this.usuarioActual = JSON.parse(u);
    this.usuarioId = this.usuarioActual.id;

    // 1. CARGAR DATOS DEL USUARIO DESDE EL SERVIDOR ✅
    // Esto recupera la fotoUrl que guardamos en la tabla 'usuarios'
    this.usuarioService.getOne(this.usuarioId).subscribe({
      next: (userServer) => {
        this.usuarioActual = userServer;

        // Si el usuario tiene foto en la DB, la usamos; si no, dejamos la de por defecto
        if (userServer.fotoUrl) {
          this.fotoUrlServidor = userServer.fotoUrl;
        }

        // Actualizamos el localStorage para que el resto de la app tenga la foto nueva
        localStorage.setItem('usuario', JSON.stringify(userServer));
        console.log("Datos del usuario actualizados desde el servidor");
      },
      error: (err) => console.error("Error al traer datos del usuario", err)
    });

    // 2. MANTENEMOS TU LÓGICA DE VIDEOS (Sin cambios) ✅
    this.respuestaService.obtenerVideos(this.usuarioId).subscribe(res => {
      this.videos = res;
    });

   this.audioService.obtenerMisCantos(this.usuarioId).subscribe(res => {
    this.misCantos = res;
  });

  }
 if (this.usuarioActual.idPublico) {
    this.cargarDatosDelBackend(this.usuarioActual.idPublico);
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

  // Verificamos el ID en la consola
  console.log("Intentando subir foto para el usuario ID:", this.usuarioId);

  if (!this.usuarioId) {
    alert("Error: El ID del usuario no existe. Recarga la página.");
    return;
  }

  // Si funcionaba antes, vamos a bajar el límite a 2MB para asegurar éxito
  if (f.size > 2 * 1024 * 1024) {
    alert("Esta foto es muy grande. Para probar que el sistema aún funciona, elige una de menos de 2MB.");
    return;
  }

  this.cargandoFoto = true;

  this.usuarioService.subirFotoPerfil(f, this.usuarioId.toString()).subscribe({
    next: (url) => {
      console.log("Subida exitosa:", url);
      this.fotoUrlServidor = url;
      this.cargandoFoto = false;
      alert("¡Sigue funcionando! Foto actualizada.");
    },
    error: (err) => {
      this.cargandoFoto = false;
      console.error("Error capturado:", err);
      alert("El servidor de Render está tardando en responder. Intenta en 1 minuto.");
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
     // this.misCantos.unshift(res);


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

cargarDatosDelBackend(idPub: string) {
  this.usuarioService.obtenerPerfilCompleto(idPub).subscribe({
    next: (data) => {
      this.perfilInfo = data;
      this.nombreUsuario = data.nombre;
      console.log('Datos recibidos:', data);
    },
    error: (err) => console.error('Error al traer perfil:', err)
  });
}

toggleAudio(player: HTMLAudioElement) {
    // Si hay otro audio sonando, lo detenemos primero
    if (this.reproductorActual && this.reproductorActual !== player) {
      this.reproductorActual.pause();
      this.reproductorActual.currentTime = 0;
    }

    if (player.paused) {
      player.play().catch(err => console.error("Error al reproducir audio:", err));
      this.reproductorActual = player;
    } else {
      player.pause();
    }
  }

  /**
   * Se ejecuta cuando un audio empieza a sonar para guardarlo como referencia
   */
  onPlay(player: HTMLAudioElement) {
    this.reproductorActual = player;
  }

  // --- FIN DE MÉTODOS NUEVOS ---


verVideo(video: any) {
  // Creamos una copia para no modificar el objeto original en la lista
  const videoData = { ...video };

  // Si el objeto no tiene urlVideo pero sí tiene urlAudio (caso de los Covers),
  // le asignamos urlAudio a urlVideo para que el modal lo reconozca.
  if (!videoData.urlVideo && videoData.urlAudio) {
    videoData.urlVideo = videoData.urlAudio;
  }

  console.log("Datos enviados al modal:", videoData);
  this.videoSeleccionado.set(videoData);
}

}
