import { Component, OnInit, signal } from '@angular/core';
import { RespuestaService } from '../../../services/respuesta.service';
import { UsuarioService } from '../../../services/usuario.service';
import { VideoDetail } from '../../components/video-detail/video-detail';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [VideoDetail, CommonModule, RouterModule]
})
export class Profile implements OnInit {
  // --- SE MANTIENE TU LÓGICA ANTERIOR ---
  selectedTab: string = 'covers'; // Cambiamos el default a 'covers' (estilo StarMaker)
  usuarioActual: any = {};
  videos: any[] = [];
  cargandoVideo: boolean = false;
  cargandoFoto: boolean = false;
  usuarioId!: number;
  fotoUrlServidor: string = 'assets/img/default.png';
  videoSeleccionado = signal<any>(null);

  // --- NUEVAS VARIABLES PARA EL DISEÑO STARMAKER ---
  perfilCompleto: any = {
    idPublico: '',
    insignias: [],
    escudos: [],
    bio: '',
    signo: '',
    fotoPortada: 'assets/img/default-portada.jpg',
    totalFollowers: 0,
    totalFollowing: 0
  };

  constructor(
    private respuestaService: RespuestaService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    const u = localStorage.getItem('usuario');
    if (u) {
      this.usuarioActual = JSON.parse(u);
      this.usuarioId = this.usuarioActual.id;

      // 1. CARGAR DATOS BASE (Se mantiene tu getOne)
      this.usuarioService.getOne(this.usuarioId).subscribe({
        next: (userServer) => {
          this.usuarioActual = userServer;
          if (userServer.fotoUrl) this.fotoUrlServidor = userServer.fotoUrl;

          // 2. NUEVO: CARGAR PERFIL EXTENDIDO (Insignias, ID Público, etc.)
          // Si el usuario ya tiene su ID público guardado, lo usamos
          if (userServer.idPublico) {
            this.cargarDatosExtra(userServer.idPublico);
          }
        }
      });

      // 3. MANTENEMOS TU LÓGICA DE VIDEOS/COVERS
      this.respuestaService.obtenerVideos(this.usuarioId).subscribe(res => {
        this.videos = res;
      });
    }
  }

  // MÉTODO NUEVO PARA TRAER LO DE LA BASE DE DATOS NUEVA
  cargarDatosExtra(idPublico: string) {
    this.usuarioService.obtenerPerfilCompleto(idPublico).subscribe({
      next: (data) => {
        this.perfilCompleto = data;
      },
      error: (err) => console.error("Aún no hay datos extra para este perfil", err)
    });
  }

  // --- TUS MÉTODOS DE SUBIDA (NO SE TOCAN, SIGUEN IGUAL) ---
  verVideo(video: any) { this.videoSeleccionado.set(video); }

  onFotoSeleccionada(ev: any) {
    // ... Tu código original de subida de foto se queda EXACTAMENTE igual ...
    const f: File = ev.target.files && ev.target.files[0];
    if (!f || !this.usuarioId) return;
    this.cargandoFoto = true;
    this.usuarioService.subirFotoPerfil(f, this.usuarioId.toString()).subscribe({
      next: (url) => {
        this.fotoUrlServidor = url;
        this.cargandoFoto = false;
        alert("Foto actualizada.");
      },
      error: () => this.cargandoFoto = false
    });
  }

  onVideoSeleccionado(event: any) {
    // ... Tu código original de subida de video se queda EXACTAMENTE igual ...
    const file = event.target.files[0];
    if (!file) return;
    this.cargandoVideo = true;
    this.respuestaService.subirVideo(file, this.usuarioId.toString()).subscribe({
      next: (res) => {
        this.videos.unshift(res);
        this.cargandoVideo = false;
        alert("¡Video subido!");
      },
      error: () => this.cargandoVideo = false
    });
  }

  changeTab(tab: string) { this.selectedTab = tab; }
}
