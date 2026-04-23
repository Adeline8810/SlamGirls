import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tienda',
  standalone: true, // Asumiendo que es standalone
  imports: [CommonModule], // Necesario para ngFor, ngIf, class.active
  templateUrl: './tienda.html',
  styleUrls: ['./tienda.css']
})
export class Tienda implements OnInit {
  usuarioActual: any = {
    username: 'ruth',
    monedas: 4,
    avatarUrl: 'assets/user_default_avatar.png' // Avatar por defecto
  };
  tabActiva: string = 'avatar_pendant'; // Pestaña por defecto
  objetoSeleccionado: any = null; // Objeto para previsualizar y comprar

  // Base de datos de productos de la tienda (MOCK DATA - CAMBIA LAS URLs POR IMÁGENES REALES)
  // Las imágenes deben estar en assets/shop/ y ser .png transparentes
  totalProductos = [
    // Pestaña: Avatar Pendant
   { id: 1, nombre: 'Corona 1', precio: 800, tipo: 'avatar_pendant', esNuevo: true, imagenUrl: 'assets/corona1.png' },
    { id: 2, nombre: 'Corona 2', precio: 600, tipo: 'avatar_pendant', esNuevo: false, imagenUrl: 'assets/corona2.jfif' },
    { id: 3, nombre: 'Corona 3', precio: 1200, tipo: 'avatar_pendant', esNuevo: false, imagenUrl: 'assets/corona3.jfif' },
    { id: 4, nombre: 'Corona 4', precio: 1500, tipo: 'avatar_pendant', esNuevo: true, imagenUrl: 'assets/corona4.png' },
    // Pestaña: User Decoration (Fondos, etc.)
    { id: 5, nombre: 'Fond Ciel Étoilé', precio: 500, tipo: 'user_decoration', esNuevo: false, imagenUrl: 'assets/shop/decor_sky.png' },
    { id: 6, nombre: 'Fond Jardin Rose', precio: 400, tipo: 'user_decoration', esNuevo: false, imagenUrl: 'assets/shop/decor_garden.png' },
    { id: 7, nombre: 'Badge Profil VIP', precio: 1000, tipo: 'user_decoration', esNuevo: true, imagenUrl: 'assets/shop/decor_vip_badge.png' },

    // Pestaña: Sound Effect (Efectos de sonido)
    { id: 8, nombre: 'Sonnet Éclatant', precio: 300, tipo: 'sound_effect', esNuevo: false, imagenUrl: 'assets/shop/sound_sparkle.png' },
    { id: 9, nombre: 'Sonnet Melodía', precio: 350, tipo: 'sound_effect', esNuevo: false, imagenUrl: 'assets/shop/sound_melody.png' },

    // Pestaña: Populaires (Combinación de los más vendidos)
    { id: 1, nombre: 'Cadre Étoile d\'Or', precio: 800, tipo: 'populares', esNuevo: true, imagenUrl: 'assets/shop/frame_star_gold.png' },
    { id: 4, nombre: 'Cadre Diamant Bleu', precio: 1500, tipo: 'populares', esNuevo: true, imagenUrl: 'assets/shop/frame_diamond_blue.png' },
    { id: 7, nombre: 'Badge Profil VIP', precio: 1000, tipo: 'populares', esNuevo: true, imagenUrl: 'assets/shop/decor_vip_badge.png' },
  ];

  productosFiltrados: any[] = [];

  constructor() {}

  ngOnInit() {
    this.cambiarTab(this.tabActiva); // Carga la pestaña inicial
  }

  cambiarTab(tipo: string) {
    this.tabActiva = tipo;
    // Resetea la selección al cambiar de pestaña para evitar confusiones
    this.objetoSeleccionado = null;
    this.productosFiltrados = this.totalProductos.filter(item => item.tipo === tipo);
  }

  // Lógica de Previsualización: Guarda el objeto seleccionado
  seleccionarObjeto(item: any) {
    this.objetoSeleccionado = item;
    console.log('Previsualizando:', item.nombre);
    // Angular detecta el cambio en 'objetoSeleccionado' y actualiza la vista previa arriba
  }

  comprarObjeto() {
    if (!this.objetoSeleccionado) return;

    if (this.usuarioActual.monedas >= this.objetoSeleccionado.precio) {
      alert(`Has comprado: ${this.objetoSeleccionado.nombre}`);
      // Aquí irá la llamada al Backend para restar las monedas
      // Y luego deberías mover el objeto al inventario del usuario
      this.objetoSeleccionado = null; // Resetea la selección tras la compra
    } else {
      alert('¡No tienes suficientes monedas!');
    }
  }

  irAtras() { window.history.back(); }
}
