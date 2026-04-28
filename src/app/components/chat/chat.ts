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
  mensajes = signal<any[]>([]); // Aquí guardaremos la conversación
  activeTab: string | null = null;
  receptor = signal<any>({}); // Datos del perfil de la otra persona
  videos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,   // <--- Añadido
    private respuestaService: RespuestaService )// <--- Añadido)
     {}

ngOnInit() {
  this.receptorNombre = this.route.snapshot.paramMap.get('username') || 'Usuario';

  // Cambiamos el enfoque: buscamos por nombre y luego sus videos
  this.usuarioService.getOne(this.receptorNombre as any).subscribe({
    next: (user) => {
      this.receptor.set(user); // Cargamos info (foto, bio)

      // Con el ID del usuario ajeno, traemos sus fotos para el álbum
      if (user.id) {
        this.respuestaService.obtenerVideos(user.id).subscribe(res => {
          this.videos = res;
        });
      }
    },
    error: (err) => console.error("Error al cargar perfil ajeno", err)
  });
}


  enviarMensaje() {
    if (this.nuevoMensaje.trim()) {
      const mensaje = {
        texto: this.nuevoMensaje,
        soyYo: true,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Actualizamos la lista de mensajes
      this.mensajes.update(prev => [...prev, mensaje]);
      this.nuevoMensaje = ''; // Limpiamos el input
    }
  }

volver() {
    this.router.navigate(['/buscar-usuario']);
  }


}
