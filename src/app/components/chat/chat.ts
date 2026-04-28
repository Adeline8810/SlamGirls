import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { RespuestaService } from '../../../services/respuesta.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit {
  receptorNombre = '';
  nuevoMensaje = '';
  mensajes = signal<any[]>([]);
  activeTab: string | null = null;
  receptor = signal<any>({});
  videos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private respuestaService: RespuestaService
  ) {}

  ngOnInit() {
    this.receptorNombre = this.route.snapshot.paramMap.get('username') || 'Usuario';

    // Cargamos los datos del perfil ajeno
    this.usuarioService.getOne(this.receptorNombre as any).subscribe({
      next: (user) => {
        this.receptor.set(user);
        if (user.id) {
          this.respuestaService.obtenerVideos(user.id).subscribe(res => this.videos = res);
        }
      }
    });

    this.mensajes.set([
      { texto: 'Hola!', soyYo: false, hora: '10:00 AM' },
      { texto: '¿Cómo estás?', soyYo: false, hora: '10:01 AM' }
    ]);
  }

  volver() {
    this.router.navigate(['/buscar-usuario']);
  }

  enviarMensaje() {
    if (this.nuevoMensaje.trim()) {
      const mensaje = {
        texto: this.nuevoMensaje,
        soyYo: true,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.mensajes.update(prev => [...prev, mensaje]);
      this.nuevoMensaje = '';
    }
  }
}
