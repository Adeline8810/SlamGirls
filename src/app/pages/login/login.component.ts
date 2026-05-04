import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { Router } from '@angular/router';

// FIREBASE
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule]
})
export class LoginComponent {
  // 1. INYECCIONES (Deben ir aquí arriba, no dentro de funciones)
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  form: FormGroup;

  constructor() {
    // 2. Inicializamos el formulario
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    console.log("Intentando login manual...");
    if (this.form.invalid) return;

    const { username, password } = this.form.value;

    this.usuarioService.login(username, password).subscribe({
      next: (u) => {
        localStorage.setItem('usuario', JSON.stringify(u));
        if (u && u.id) {
          localStorage.setItem('usuarioId', u.id.toString());
        }
        console.log('✅ Login manual exitoso');
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        console.error('Error en login manual:', err);
        alert('Usuario o contraseña incorrectos');
      }
    });
  }

loginConGoogle() {
  const provider = new GoogleAuthProvider();

  signInWithPopup(this.auth, provider).then(async (result) => {
    // 1. Obtenemos el Token de seguridad de Firebase
    const token = await result.user.getIdToken();

    // 2. Usamos usuarioService (que ya lo tienes inyectado) en lugar de this.http
    this.usuarioService.loginFirebase(token).subscribe({
      next: (usuarioBD: any) => {
        // ✅ Ahora usuarioBD es el objeto que viene de tu Java + Supabase
        // Contiene el ID numérico que evitará el error de "String to Long"
        localStorage.setItem('usuario', JSON.stringify(usuarioBD));
        localStorage.setItem('usuarioId', usuarioBD.id.toString());

        console.log('✅ Usuario sincronizado en Supabase con ID:', usuarioBD.id);
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        console.error('❌ Error al sincronizar con Render/Supabase:', err);
        alert('Error al conectar con el servidor.');
      }
    });
  }).catch(error => {
    console.error('❌ Error de Firebase:', error);
  });
}
}
