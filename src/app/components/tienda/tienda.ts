import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tienda',
  templateUrl: './tienda.html',
  styleUrls: ['./tienda.css']
})
export class Tienda implements OnInit {
  usuarioActual: any = { username: 'ruth', monedas: 4 };
  tabActiva: string = 'populares';
  regaloSeleccionado: any = null;

  // Lista de regalos de ejemplo
  listaRegalos = [
    { id: 1, nombre: 'Cristal Azul', precio: 800, tipo: 'populares', esNuevo: true, imagenUrl: 'assets/gifts/crystal.png' },
    { id: 2, nombre: 'Delfín Mágico', precio: 600, tipo: 'populares', esNuevo: false, imagenUrl: 'assets/gifts/dolphin.png' },
    { id: 3, nombre: 'Corona Oro', precio: 1500, tipo: 'especiales', esNuevo: true, imagenUrl: 'assets/gifts/crown.png' },
    // Agrega más según tus imágenes...
  ];

  regalosFiltrados: any[] = [];

  ngOnInit() {
    this.cambiarTab('populares');
  }

  cambiarTab(tipo: string) {
    this.tabActiva = tipo;
    this.regalosFiltrados = this.listaRegalos.filter(r => r.tipo === tipo);
  }

  seleccionarRegalo(regalo: any) {
    this.regaloSeleccionado = regalo;
  }

  comprarRegalo() {
    if (this.usuarioActual.monedas >= this.regaloSeleccionado.precio) {
      alert(`Has comprado: ${this.regaloSeleccionado.nombre}`);
      // Aquí irá la llamada al Backend para restar las monedas
    } else {
      alert('¡No tienes suficientes monedas!');
    }
  }

  irAtras() { window.history.back(); }
}
