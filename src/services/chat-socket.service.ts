import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  private stompClient: any;
  public mensajeSubject = new Subject<any>();

  constructor() {
    this.conectar();
  }

  conectar() {
    // Usamos la URL de tu backend en Render
   const socket = new (SockJS as any)('https://backend-ruth-slam.onrender.com/ws-chat');
    this.stompClient = Stomp.over(socket);


    // Desactivamos logs molestos en consola
    this.stompClient.debug = () => {};

    this.stompClient.connect({}, () => {
      console.log('✅ Conectado a STOMP en Render');
      this.stompClient.subscribe('/topic/mensajes', (msg: any) => {
        if (msg.body) {
          this.mensajeSubject.next(JSON.parse(msg.body));
        }
      });
    }, (error: any) => {
      console.error('❌ Error de conexión:', error);
      // Reintento automático tras 5 segundos si se cae
      setTimeout(() => this.conectar(), 5000);
    });
  }

  enviarMensaje(data: any) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/enviar-mensaje', {}, JSON.stringify(data));
    } else {
      console.error('No se pudo enviar: Cliente no conectado');
    }
  }
}
