import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecargarService } from '../../../services/recargar.service';
import { environment } from '../../../environment';

declare var paypal: any;
@Component({
  selector: 'app-recargar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recargar.html',
  styleUrl: './recargar.css'
})
export class Recargar implements OnInit {
  usuarioActual: any = { username: '', monedas: 0 };
  cargando: boolean = true;
  //usuarioActual: any = { monedas: 0 };
  montoSeleccionado: number = 0;
  monedasAEntregar: number = 0;

  constructor(private recargarService: RecargarService) { }

  ngOnInit() {
    this.cargarDatos();
    this.renderPaypalButton();
  }

prepararPago(monedas: number, precio: number) {
  this.monedasAEntregar = monedas;
  this.montoSeleccionado = precio;

  // Esperamos un milisegundo para que el div aparezca en el HTML y luego dibujamos el botón
  setTimeout(() => {
    this.renderPaypalButton();
  }, 100);
}

  renderPaypalButton() {
    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: this.montoSeleccionado.toString() // Usa el precio seleccionado
            }
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          alert('¡Pago exitoso, ' + details.payer.name.given_name + '!');
          // AQUÍ llamarías a tu servicio de Java para sumar las monedas
          console.log('Entregar monedas:', this.monedasAEntregar);
        });
      }
    }).render('#paypal-button-container');
  }


cargarDatos() {
    // 1. Obtenemos el nombre de usuario del localStorage
    const user = localStorage.getItem('username') || 'ruth';

    // 2. Llamamos al método del servicio (el que creamos con /api/usuarios/monedas/)
    this.recargarService.obtenerDatosUsuario(user).subscribe({
      next: (data) => {
        // 3. Asignamos los datos recibidos (que incluyen las monedas) a nuestra variable
        this.usuarioActual = data;
        this.cargando = false;
        console.log('Datos cargados:', data);
      },
      error: (err) => {
        console.error('Error al obtener monedas', err);
        this.cargando = false;
      }
    });
  }

  contactarWhatsApp(cantidad: number, precio: number) {
    const url = this.recargarService.generarLinkWhatsApp(
      this.usuarioActual.username,
      cantidad,
      precio
    );
    window.open(url, '_blank');
  }

  irAtras() {
    window.history.back();
  }

  verDetalles() {
    // Por si quieren ver el historial de compras
    console.log("Détails du compte cliqué");
  }

  obtenerTiempo() { return new Date().getTime(); }
}
