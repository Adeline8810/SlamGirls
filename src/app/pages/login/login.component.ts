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
  // 1. Inyectamos Auth de forma moderna para evitar el error NG0201
  private httpAuth = inject(Auth);
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  // Definimos el formulario con su tipo
  form: FormGroup;

  constructor() {
    // 2. Inicializamos el formulario de forma limpia
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;

    const { username, password } = this.form.value;

    this.usuarioService.login(username, password).subscribe({
      next: (u) => {
        localStorage.setItem('usuario', JSON.stringify(u));

        if (u && u.id) {
          localStorage.setItem('usuarioId', u.id.toString());
        }

        // Lógica de redirección
        if (u?.username === 'ruthadeline') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/inicio']);
        }
      },
      error: (err) => {
        console.error('Error en login manual:', err);
        alert('Usuario o contraseña incorrectos');
      }
    });
  }

  loginConGoogle() {
    const provider = new GoogleAuthProvider();

    // Forzamos la selección de cuenta para evitar bloqueos
    provider.setCustomParameters({ prompt: 'select_account' });

    signInWithPopup(this.httpAuth, provider)
      .then((result) => {
        const user = result.user;

        localStorage.setItem('usuario', JSON.stringify({
          username: user.displayName,
          email: user.email,
          id: user.uid
        }));

        console.log('✅ Login Google exitoso');
        this.router.navigate(['/inicio']);
      })
      .catch((error) => {
        console.error('❌ Error de Firebase Auth:', error);
        if (error.code === 'auth/operation-not-allowed') {
          alert('Error: Debes habilitar Google en la consola de Firebase -> Authentication.');
        } else {
          alert('Error al iniciar sesión con Google.');
        }
      });
  }
}
