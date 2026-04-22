import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecargarService {
  // Siguiendo tu estructura de URLs
  private apiUsuarios = 'https://backend-ruth-slam.onrender.com/api/usuarios';

  constructor(private http: HttpClient) { }

  // Obtener monedas actuales del usuario
  obtenerPerfil(username: string): Observable<any> {
    return this.http.get(`${this.apiUsuarios}/${username}`);
  }

  // Generador de enlace de WhatsApp en Francés
  generarLinkWhatsApp(username: string, monedas: number, precio: number): string {
    const miTelefono = "34600000000"; // Tu número real aquí
    const mensaje = `Bonjour! Je suis ${username}. Je souhaite recharger ${monedas} pièces pour $${precio}. Comment puis-je payer?`;
    return `https://wa.me/${miTelefono}?text=${encodeURIComponent(mensaje)}`;
  }
}
