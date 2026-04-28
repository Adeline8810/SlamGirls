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
  // 1. Obtenemos el nombre de la URL
  this.receptorNombre = this.route.snapshot.paramMap.get('username') || 'Usuario';

  // 2. Escuchar mensajes (Socket)
this.chatSubscription = this.socketService.mensajeSubject.subscribe((msg) => {
  console.log("Llegó mensaje del servidor:", msg);

  // REGLA: Si el emisor NO soy yo, entonces es del otro.
  if (msg.emisorId !== this.miUsuario.id) {
    this.mensajes.update(prev => [
      ...prev,
      { ...msg, soyYo: false, hora: msg.hora || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    this.hacerScroll();
  }
});
  // 3. CARGAR DATOS DEL RECEPTOR (Usando el nombre, no el ID)
  // Cambiamos getOne por obtenerDetallesUsuario
  this.usuarioService.obtenerDetallesUsuario(this.receptorNombre).subscribe({
    next: (res: any) => {
      // Manejo de respuesta para encontrar al usuario correcto
      let encontrado = Array.isArray(res)
        ? res.find((u: any) => u.username === this.receptorNombre)
        : res;

      if (encontrado) {
        this.receptor.set(encontrado);

        // --- AQUÍ CARGAMOS LOS VIDEOS ---
        // Usamos directamente el servicio de respuesta como hacías antes
        if (encontrado.id) {
          this.respuestaService.obtenerVideos(encontrado.id).subscribe(resVideos => {
            this.videos = resVideos;
          });
        }
      }
    },
    error: (err) => console.error("Error al cargar datos del chat", err)
  });

  // Mensajes de prueba (opcional)
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

  // Validamos que haya texto y que sepamos quién es el receptor
  if (mensajeLimpio && this.receptor()?.id) {
    const mensajeData = {
      texto: mensajeLimpio,
      emisorId: this.miUsuario.id,
      receptorId: this.receptor().id,
      soyYo: true,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 1. Enviamos al servidor
    this.socketService.enviarMensaje(mensajeData);

    // 2. Lo pintamos en nuestra pantalla inmediatamente
    this.mensajes.update(prev => [...prev, mensajeData]);

    // 3. ¡IMPORTANTE! Limpiamos el cajón de texto
    this.nuevoMensaje = '';

    // 4. Bajamos el scroll
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
