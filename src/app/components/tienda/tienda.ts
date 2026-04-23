import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tienda.html',
  styleUrls: ['./tienda.css']
})
export class Tienda implements OnInit {
  fotoUrlServidor: string | null = null;
  usuarioActual: any = {
    username: 'ruth',
    monedas: 4,
    avatarUrl: 'assets/user_default_avatar.png'
  };

  tabActiva: string = 'avatar_pendant';
  objetoSeleccionado: any = null;
  productosFiltrados: any[] = [];

  totalProductos = [
    // Avatar Pendants
    { id: 1, nombre: 'Corona 1', precio: 800, tipo: 'avatar_pendant', esNuevo: true, imagenUrl: 'assets/corona1.png' },
    { id: 2, nombre: 'Corona 2', precio: 600, tipo: 'avatar_pendant', esNuevo: false, imagenUrl: 'assets/corona2.png' },
    { id: 3, nombre: 'Corona 3', precio: 1200, tipo: 'avatar_pendant', esNuevo: false, imagenUrl: 'assets/corona3.png' },
    { id: 4, nombre: 'Corona 4', precio: 1500, tipo: 'avatar_pendant', esNuevo: true, imagenUrl: 'assets/corona4.png' },
    { id: 5, nombre: 'Corona 5', precio: 1500, tipo: 'avatar_pendant', esNuevo: true, imagenUrl: 'assets/corona5.png' },
    { id: 6, nombre: 'Corona 6', precio: 1500, tipo: 'avatar_pendant', esNuevo: true, imagenUrl: 'assets/corona6.png' },
    { id: 7, nombre: 'Corona 7', precio: 1500, tipo: 'avatar_pendant', esNuevo: true, imagenUrl: 'assets/corona7.png' },
    { id: 8, nombre: 'Corona 8', precio: 1500, tipo: 'avatar_pendant', esNuevo: true, imagenUrl: 'assets/corona8.png' },
    { id: 9, nombre: 'Corona 9', precio: 1500, tipo: 'avatar_pendant', esNuevo: true, imagenUrl: 'assets/corona9.png' },

    // User Decoration
    { id: 10, nombre: 'Fond Ciel Étoilé', precio: 500, tipo: 'user_decoration', esNuevo: false, imagenUrl: 'assets/shop/decor_sky.png' },
    { id: 11, nombre: 'Fond Jardin Rose', precio: 400, tipo: 'user_decoration', esNuevo: false, imagenUrl: 'assets/shop/decor_garden.png' },
    { id: 12, nombre: 'Badge Profil VIP', precio: 1000, tipo: 'user_decoration', esNuevo: true, imagenUrl: 'assets/shop/decor_vip_badge.png' },

    // Sound Effect
    { id: 13, nombre: 'Sonnet Éclatant', precio: 300, tipo: 'sound_effect', esNuevo: false, imagenUrl: 'assets/shop/sound_sparkle.png' },
    { id: 14, nombre: 'Sonnet Melodía', precio: 350, tipo: 'sound_effect', esNuevo: false, imagenUrl: 'assets/shop/sound_melody.png' },

    // Populaires
    { id: 15, nombre: 'Cadre Étoile d\'Or', precio: 800, tipo: 'populares', esNuevo: true, imagenUrl: 'assets/shop/frame_star_gold.png' },
    { id: 16, nombre: 'Cadre Diamant Bleu', precio: 1500, tipo: 'populares', esNuevo: true, imagenUrl: 'assets/shop/frame_diamond_blue.png' }
  ];

  ngOnInit() {
    this.cambiarTab(this.tabActiva);
    const fotoGuardada = localStorage.getItem('user_foto_perfil');
    if (fotoGuardada) {
      this.fotoUrlServidor = fotoGuardada;
    } else if (this.usuarioActual?.avatarUrl) {
      this.fotoUrlServidor = this.usuarioActual.avatarUrl;
    }
  }

  cambiarTab(tipo: string) {
    this.tabActiva = tipo;
    this.objetoSeleccionado = null;
    this.productosFiltrados = this.totalProductos.filter(item => item.tipo === tipo);
  }

  seleccionarObjeto(item: any) {
    this.objetoSeleccionado = item;
  }

  comprarObjeto() {
    if (!this.objetoSeleccionado) return;
    if (this.usuarioActual.monedas >= this.objetoSeleccionado.precio) {
      alert(`Has comprado: ${this.objetoSeleccionado.nombre}`);
      this.objetoSeleccionado = null;
    } else {
      alert('¡No tienes suficientes monedas!');
    }
  }

  irAtras() { window.history.back(); }


obtenerAncho(id: string): number {
  // Ajusta estos valores probando cuál hace que el círculo encaje
  switch(id) {
    case 'corona_8': return 220; // Más grande para que el centro no se encoja
    case 'corona_9': return 240; // Las alas son muy anchas, necesita más ancho
    case 'corona_4': return 180;
    default: return 150;        // Tamaño estándar para las normales (1, 2, 5)
  }
}

obtenerEscala(id: number): string {
  switch(id) {
    case 4:
      return 'scale(1.3)'; // Agrandamos la corona 4 para cerrar el espacio blanco
    case 8:
      return 'scale(0.9)';
    case 9:
      return 'scale(0.9)'; // Reducimos las coronas muy grandes
    default:
      return 'scale(1.1)'; // Escala normal para el resto
  }
}

}
