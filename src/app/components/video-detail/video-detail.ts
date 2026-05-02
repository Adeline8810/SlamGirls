import { Component, EventEmitter, Input, Output, signal, OnInit, inject } from '@angular/core'; // <--- ESTO DEBE SER @angular/core
import { CommonModule } from '@angular/common';
import { RecargarService } from '../../../services/recargar.service';
import confetti from 'canvas-confetti';
import { Router, RouterModule } from '@angular/router';
import { StarmakerPlayer } from '../starmaker-player/starmaker-player';
import { StarmakerLyrics } from '../starmaker-lyrics/starmaker-lyrics';
import { ComentarioService } from '../../../services/comentario.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-detail',

  standalone: true,
  imports: [CommonModule, RouterModule, StarmakerPlayer, StarmakerLyrics,FormsModule],
  templateUrl: './video-detail.html',
  styleUrl: './video-detail.css'
})
export class VideoDetail implements OnInit {
  // --- Entradas y Salidas ---
  @Input() video: any;
  @Input() canto: any;
  @Output() cerrar = new EventEmitter<void>();

  // --- Servicios ---
  private router = inject(Router);
  private recargarService = inject(RecargarService);

  // --- Estado de la Interfaz ---
  mostrarRegalos: boolean = false;
  panelActivo: 'ninguno' | 'comentarios' | 'regalos' | 'compartir' = 'ninguno';
  tabActual: 'gift' | 'comments' = 'gift';

  // --- Lógica de Monedas y Regalos (Signals) ---
  misMonedas = signal<number>(0);
  regaloSeleccionado = signal<any>(null);
  efectoActivo = signal<string | null>(null);
  contadorRegalo = signal(0);
  timerRegalo: any;
  mostrarComentarios: boolean = false;

  textoComentario: string = '';
  listaComentarios: any[] = [];

  // --- Tu Lista de Activos ---
  listaRegalos = [
    { id: 1, nombre: 'Rose', precio: 3, icon: 'assets/regalo1.png' },
    { id: 2, nombre: 'Microphone', precio: 9, icon: 'assets/regalo2.png' },
    { id: 3, nombre: 'Songful', precio: 18, icon: 'assets/regalo3.png' },
    { id: 4, nombre: 'Glow sticks', precio: 48, icon: 'assets/regalo4.png' },
    { id: 5, nombre: 'Music Box', precio: 60, icon: 'assets/regalo5.png' },
    { id: 6, nombre: 'Ferrari', precio: 3000, icon: 'assets/regalo6.png' },
    { id: 7, nombre: 'Pearl', precio: 200, icon: 'assets/regalo7.png' }
  ];

  constructor(private comentarioService: ComentarioService) {}

  ngOnInit() {
    this.obtenerMonedas();
    this.cargarComentarios();
  }

  // --- Gestión de Monedas ---
  obtenerMonedas() {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.recargarService.obtenerDatosUsuario(user.username).subscribe({
        next: (data) => this.misMonedas.set(data.monedas),
        error: (err) => console.error('Error al jalar monedas', err)
      });
    }
  }

  // --- Control de Paneles ---
  toggleRegalos() {
    this.mostrarRegalos = !this.mostrarRegalos;
    this.panelActivo = this.mostrarRegalos ? 'regalos' : 'ninguno';
  }

  cerrarPaneles() {
    this.mostrarRegalos = false;
    this.panelActivo = 'ninguno';
  }

  // --- Lógica de Regalos ---
  seleccionarRegalo(regalo: any) {
    this.regaloSeleccionado.set(regalo);
  }

  lanzarRegalo() {
    const regalo = this.regaloSeleccionado();
    if (!regalo || this.misMonedas() < regalo.precio) {
      alert("Monedas insuficientes, Ruth");
      return;
    }

    // Aplicar lógica de cobro y efectos
    this.efectoActivo.set(regalo.icon);
    this.dispararEfectoEstrellas();
    this.misMonedas.update(m => m - regalo.precio);
    this.contadorRegalo.update(v => v + 1);

    // Resetear el efecto tras 3 segundos
    if (this.timerRegalo) clearTimeout(this.timerRegalo);
    this.timerRegalo = setTimeout(() => {
      this.contadorRegalo.set(0);
      this.efectoActivo.set(null);
    }, 3000);
  }

  private dispararEfectoEstrellas() {
    const originLeft = { x: 0.1, y: 0.9 };
    const originRight = { x: 0.9, y: 0.9 };
    const config = { particleCount: 3, spread: 55, colors: ['#FFE100', '#FFD700', '#FFFFFF'], shapes: ['star' as const], zIndex: 10000 };

    confetti({ ...config, angle: 60, origin: originLeft });
    confetti({ ...config, angle: 120, origin: originRight });
  }

  abrirPantallaRecarga() {
    this.router.navigate(['/recargar']);
  }

  publicarComentario() {
console.log("Botón pulsado. Valor detectado:", this.textoComentario);

    // Si el log de arriba sale vacío, vamos a forzar la lectura del input
    if (!this.textoComentario || this.textoComentario.trim() === '') {
        console.warn("La variable está vacía.");
        return;
    }



  const usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');

  // LOGS PARA DEPURAR (Mira estos en la consola después de darle al botón)
  console.log("Variable 'video':", this.video);
  console.log("ID del video:", this.video?.id);
  console.log("ID del usuario logueado:", usuarioLogueado?.id);

  // Verificamos que existan los datos necesarios
  if (!this.video?.id || !usuarioLogueado?.id) {
    console.error("Faltan datos: video.id o usuarioLogueado.id no existen.");
    return;
  }

  const nuevoComentario = {
    videoId: this.video.id,
    usuarioId: usuarioLogueado.id,
    ownerId: this.video.usuarioId, // El dueño del video según tu consola es 'usuarioId'
    contenido: this.textoComentario,
    parentId: null
  };

  console.log("Enviando al backend:", nuevoComentario);

  this.comentarioService.guardarComentario(nuevoComentario).subscribe({
    next: (res) => {
      console.log('¡Éxito!', res);
      this.textoComentario = '';
      this.cargarComentarios();
      // Aquí podrías llamar a una función para recargar la lista
    },
    error: (err) => {
      console.error('Error HTTP al guardar:', err);
    }
  });
}

cargarComentarios() {
  if (!this.video?.id) return;

  this.comentarioService.obtenerComentariosPorVideo(this.video.id).subscribe({
    next: (data) => {
      this.listaComentarios = data;
      console.log("Comentarios cargados:", data);
    },
    error: (err) => console.error("Error al obtener comentarios", err)
  });
}

darLikeComentario(comentario: any) {
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!usuarioLogueado.id) return;

    this.comentarioService.toggleLike(comentario.id, usuarioLogueado.id).subscribe({
        next: (res) => {
            console.log(res); // "Like agregado" o "Like quitado"
            // Refrescamos los comentarios para que se actualice el número de likes
            this.cargarComentarios();
        },
        error: (err) => console.error("Error al procesar like", err)
    });
}
}
