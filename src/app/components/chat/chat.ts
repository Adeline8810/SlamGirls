import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  constructor(private route: ActivatedRoute,private router: Router) {}

  ngOnInit() {
    // Obtenemos el nombre de la persona con la que vamos a hablar desde la URL
    this.receptorNombre = this.route.snapshot.paramMap.get('username') || 'Usuario';

    // Simulación de mensajes iniciales
    this.mensajes.set([
      { texto: 'Hola!', soyYo: false, hora: '10:00 AM' },
      { texto: '¿Cómo estás?', soyYo: false, hora: '10:01 AM' }
    ]);
  }


// ESTA ES LA FUNCIÓN QUE TE FALTA SEGÚN TU CAPTURA
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

      // Actualizamos la lista de mensajes
      this.mensajes.update(prev => [...prev, mensaje]);
      this.nuevoMensaje = ''; // Limpiamos el input
    }
  }


}
