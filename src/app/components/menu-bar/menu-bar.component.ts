import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RespuestaService } from '../../../services/respuesta.service';

@Component({
  selector: 'app-menubar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  usuario: any = null;
  esAdmin = false;

  //constructor(private router: Router) {}
  constructor(private respuestaService: RespuestaService, private router: Router) {}

  ngOnInit(): void {
    const u = localStorage.getItem('usuario');
    this.usuario = u ? JSON.parse(u) : null;
    this.esAdmin = this.usuario?.username === 'ruthadeline';
  }

  /*go(path: string) {
     this.router.navigate([path]);

    }*/
   go(path: string) {
  // Si el camino es /slam, mandamos el aviso de reinicio antes de navegar
  if (path === '/slam') {
    this.respuestaService.dispararReinicio();
  }

  this.router.navigate([path]);
}
  logout() { localStorage.removeItem('usuario'); this.router.navigate(['/']); }

irABuscarAmigo() {
  this.router.navigate(['/buscar-amigo']); // Esto redirige a la nueva vista
}


irRecargar() {
  this.router.navigate(['/recargar']); // Esto redirige a la nueva vista
}

irTienda() {
  this.router.navigate(['/tienda']); // Esto redirige a la nueva vista
}


}
