import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ver-live',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="viewer-container">
      <div class="live-header">
        <span class="badge">EN VIVO</span>
        <p>Viendo a: Usuario {{ userId }}</p>
      </div>

      <!-- Aquí es donde se vería el video del otro -->
      <div class="video-placeholder">
        <p>Conectando con la señal de video...</p>
      </div>

      <button class="btn-exit" routerLink="/">SALIR</button>
    </div>
  `,
  styles: [`
    .viewer-container { height: 100vh; background: #000; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .badge { background: red; padding: 5px 10px; border-radius: 5px; font-weight: bold; }
    .video-placeholder { width: 90%; height: 60%; border: 2px dashed #444; display: flex; align-items: center; justify-content: center; margin: 20px 0; }
    .btn-exit { background: #333; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; }
  `]
})
export class VerLive implements OnInit {
  private route = inject(ActivatedRoute);
  userId: string | null = '';

  ngOnInit() {
    // Obtenemos el ID del usuario que está en vivo desde la URL
    this.userId = this.route.snapshot.paramMap.get('id');
  }
}
