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
  mensajes = signal<any[]>([]); // Usas signals, así que se actualiza con .set() o .update()
  activeTab: string | null = null;
  receptor = signal<any>({});
  videos: any[] = [];
  miUsuario: any;

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
  // 1. Nombre de la URL
  this.receptorNombre = this.route.snapshot.paramMap.get('username') || 'Usuario';

  // 2. Escuchar Socket
  this.chatSubscription = this.socketService.mensajeSubject.subscribe((msg) => {
    // ESTOS LOGS SON PARA VER POR QUÉ NO SALE EL MENSAJE DEL OTRO
    console.log("--- NUEVO MENSAJE RECIBIDO ---");
    console.log("Contenido:", msg.texto);
    console.log("¿Quién lo envía (emisorId)?:", msg.emisorId);
    console.log("¿Quién soy yo (miUsuario.id)?:", this.miUsuario.id);
    console.log("¿Con quién estoy hablando (receptor id)?:", this.receptor()?.id);

    // Si el emisor NO soy yo, lo agrego a la pantalla
    if (msg.emisorId !== this.miUsuario.id) {
      console.log("✅ El mensaje es del otro. Agregando a la lista...");
      this.mensajes.update(prev => [
        ...prev,
        { ...msg, soyYo: false }
      ]);
      this.hacerScroll();
    } else {
      console.log("ℹ️ El mensaje lo envié yo (o tiene mi ID), por eso el socket lo ignora aquí.");
    }
  });

  // 3. CARGAR RECEPTOR (Busca los datos de la persona con la que hablas)
  this.usuarioService.obtenerDetallesUsuario(this.receptorNombre).subscribe({
    next: (res: any) => {
      let encontrado = Array.isArray(res)
        ? res.find((u: any) => u.username === this.receptorNombre)
        : res;

      if (encontrado) {
        console.log("✅ Receptor cargado:", encontrado);
        this.receptor.set(encontrado);

        // Una vez tenemos al receptor, cargamos sus videos e historial
        if (encontrado.id) {
          this.respuestaService.obtenerVideos(encontrado.id).subscribe(resVideos => {
            this.videos = resVideos;
          });

          this.cargarHistorial();
        }
      }
    },
    error: (err) => console.error("Error al cargar datos del chat", err)
  });
}

  cargarHistorial() {
  const emisorId = this.miUsuario.id;
  const receptorId = this.receptor().id;

  if (!emisorId || !receptorId) {
    console.warn("Faltan IDs para cargar el historial");
    return;
  }

  this.usuarioService.obtenerHistorial(emisorId, receptorId).subscribe({
    next: (historial) => {
      console.log("Historial recibido de DB:", historial); // Para que veas si vienen los del otro

      const mensajesFormateados = historial.map(m => ({
        texto: m.texto,
        emisorId: m.emisorId,
        receptorId: m.receptorId,
        hora: m.hora,
        // Usamos == para evitar problemas de tipo (string vs number)
        soyYo: m.emisorId == this.miUsuario.id
      }));

      this.mensajes.set(mensajesFormateados);
      this.hacerScroll();
    },
    error: (err) => console.error('Error cargando historial', err)
  });
}

  enviarMensaje() {
    console.log("Intentando enviar mensaje...");
  const mensajeLimpio = this.nuevoMensaje.trim();

  if (mensajeLimpio && this.receptor()?.id) {
    const mensajeData = {
      texto: mensajeLimpio,
      emisorId: this.miUsuario.id,
      receptorId: this.receptor().id,
      soyYo: true, // Esto hace que se pinte a la derecha
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.socketService.enviarMensaje(mensajeData);

    // ESTO PINTA EL MENSAJE INSTANTÁNEAMENTE EN TU PANTALLA
    this.mensajes.update(prev => [...prev, mensajeData]);

    this.nuevoMensaje = '';
    this.hacerScroll();
  }
}

  // --- RESTO DE MÉTODOS ---
  agregarEmoji(emoji: string) {
    this.nuevoMensaje += emoji;
    this.activeTab = null;
  }

  enviarTruth() {
    const preguntas = ["¿Cuáles son tus pasatiempos?", "¿Eres mujer o hombre?", "¿Qué música te gusta?"];
    this.nuevoMensaje = preguntas[Math.floor(Math.random() * preguntas.length)];
    this.enviarMensaje();
  }

  hacerScroll() {
    setTimeout(() => {
      const objDiv = document.getElementById("message-area");
      if (objDiv) objDiv.scrollTop = objDiv.scrollHeight;
    }, 100);
  }

  ngOnDestroy() {
    if (this.chatSubscription) this.chatSubscription.unsubscribe();
  }

  volver() {
    this.router.navigate(['/buscar-usuario']);
  }
}
