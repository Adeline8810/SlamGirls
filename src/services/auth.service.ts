import { Injectable, inject } from '@angular/core'; // Añade inject aquí
import jwt_decode from "jwt-decode";


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  constructor() { }


  getUsuarioLogueado(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return jwt_decode(token);
  }

  get usuarioId(): number | null {
    const usuario = this.getUsuarioLogueado();
    return usuario ? usuario.id : null;
  }

  get usuarioRol(): number | null {
    const usuario = this.getUsuarioLogueado();
    return usuario ? usuario.idRol : null;
  }
}
