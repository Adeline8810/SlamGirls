import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../models/usuario';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  // 1. Limpiamos la URL para que sea solo la base de usuarios
  private api = 'https://backend-ruth-slam.onrender.com/api/usuarios';

  constructor(private http: HttpClient) {}

  // 2. Ajustamos los endpoints para que no se repitan palabras
  register(u: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.api}/register`, u);
  }

  login(username: string, password: string): Observable<Usuario> {
    // Esto ahora irá a .../api/usuarios/login (CORRECTO)
    return this.http.post<Usuario>(`${this.api}/login`, { username, password });
  }

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.api);
  }

  agregarUsuario(u: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.api}/register`, u);
  }

  actualizarUsuario(id: number, u: Usuario) {
    return this.http.put<Usuario>(`${this.api}/${id}`, u);
  }

  eliminarUsuario(id: number) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }



subirFotoPerfil(file: File, usuarioId: string): Observable<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('usuarioId', usuarioId);

  // CAMBIO: Ahora la URL termina en /api/usuarios/upload-foto ✅
  return this.http.post('https://backend-ruth-slam.onrender.com/api/usuarios/upload-foto', formData, {
    responseType: 'text'
  });
}




}
