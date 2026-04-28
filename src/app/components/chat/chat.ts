import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { RespuestaService } from '../../../services/respuesta.service';
import { ChatSocketService } from '../../../services/chat-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, OnDestroy {
  receptorNombre = '';
  nuevoMensaje = '';
  mensajes = signal<any[]>([]);
  activeTab: string | null = null;
  receptor = signal<any>({});
  videos: any[] = [];
  miUsuario: any;

  // Guardamos la suscripción para evitar fugas de memoria
  private chatSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private respuestaService: RespuestaService,
    private socketService: ChatSocketService
  ) {
    this.miUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  }

  ngOnInit() {
    this.receptorNombre = this.route.snapshot.paramMap.get('username') || 'Usuario';

    // 1. Escuchar mensajes desde Spring Boot (STOMP)
    this.chatSubscription = this.socketService.mensajeSubject.subscribe((msg) => {
      // Si el mensaje viene del usuario con el que hablo, lo muestro
      if (msg.emisorId === this.receptor().id) {
        this.mensajes.update(prev => [...prev, { ...msg, soyYo: false }]);
        this.hacerScroll();
      }
    });

    // 2. Cargar datos del perfil del receptor
    // Usamos 'as any' para evitar el error de tipo string vs number
    this.usuarioService.getOne(this.receptorNombre as any).subscribe({
      next: (user) => {
        this.receptor.set(user);
        if (user.id) {
          this.respuestaService.obtenerVideos(user.id).subscribe(res => this.videos = res);
        }
      }
    });

    // Mensajes iniciales de prueba
    this.mensajes.set([
      { texto: '¡Hola!', soyYo: false, hora: '10:00 AM' },
      { texto: '¿Cómo estás?', soyYo: false, hora: '10:01 AM' }
    ]);
  }

  ngOnDestroy() {
    // Cerramos la suscripción cuando el usuario sale del chat
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }

  volver() {
    this.router.navigate(['/buscar-usuario']);
  }

  enviarMensaje() {
  const mensajeLimpio = this.nuevoMensaje.trim();

  if (mensajeLimpio && this.receptor().id) {
    const mensajeData = {
      texto: mensajeLimpio,
      emisorId: this.miUsuario.id,
      receptorId: this.receptor().id,
      soyYo: true, // Lo marcamos para nosotros
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Enviar al servidor
    this.socketService.enviarMensaje(mensajeData);

    // Actualizar pantalla local
    this.mensajes.update(prev => [...prev, mensajeData]);

    // Limpiar y scroll
    this.nuevoMensaje = '';
    this.hacerScroll();
  }
}

  enviarTruth() {
    const preguntas = [
      "¿Cuáles son tus pasatiempos?",
      "¿Eres mujer o hombre?",
      "¿Qué música te gusta?"
    ];
    const azar = preguntas[Math.floor(Math.random() * preguntas.length)];
    this.nuevoMensaje = azar;
    this.enviarMensaje();
  }

  hacerScroll() {
    setTimeout(() => {
      const objDiv = document.getElementById("message-area");
      if (objDiv) objDiv.scrollTop = objDiv.scrollHeight;
    }, 100);
  }
}
