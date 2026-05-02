import { Component, OnInit, inject } from '@angular/core'; // 1. Importa 'inject'
import { CommonModule } from '@angular/common';
import { LiveService } from '../../../services/live.service';
import { VideoService } from '../../../services/video.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true, // Asegúrate de que esto esté así si usas imports aquí
  imports: [RouterModule, CommonModule], // 2. Agrégalo aquí
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio implements OnInit {
  listaLives: any[] = [];
  listaVideos: any[] = [];
  usuarioId: string = localStorage.getItem('usuarioId') || '0';

  // 2. Inyecta los servicios directamente aquí (forma moderna)
  private liveService = inject(LiveService);
  private videoService = inject(VideoService);

  constructor() {} // El constructor queda vacío

  ngOnInit() {
    // 3. El resto del código funciona exactamente igual
    this.liveService.getLivesActivos().subscribe(data => this.listaLives = data);

    this.videoService.obtenerTodosLosVideos().subscribe(data => {
      this.listaVideos = data;
    });
  }
}
