import { Component, OnInit , signal} from '@angular/core';
import { RespuestaService } from '../../../services/respuesta.service'; // Ajusta la ruta a tu proyecto
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

  // Vista previa inmediata para que el usuario no espere
  const reader = new FileReader();
  reader.onload = (e) => {
    this.fotoUrlServidor = (e.target as any).result;
  };
  reader.readAsDataURL(f);

  const idParaSubir = this.usuarioId.toString();
  this.respuestaService.subirFoto(f, idParaSubir).subscribe({
    next: (urlRecibida) => {
      // Como Java ahora manda la URL de Cloudinary, la usamos directamente ✅
      const urlFinal = urlRecibida;

      this.fotoUrlServidor = urlFinal;
      if(this.usuarioActual) this.usuarioActual.avatarUrl = urlFinal;

      // Guardamos en localStorage para que al refrescar la página se mantenga
      localStorage.setItem('user_foto_perfil', urlFinal);
      console.log("Foto guardada permanentemente en Cloudinary:", urlFinal);
    },
    error: (err) => {
      console.error('Error al subir foto:', err);
      alert('Error: Revisa que el API SECRET en Render termine en 0 y no en 8'); //
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
