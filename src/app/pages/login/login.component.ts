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
    provider.setCustomParameters({ prompt: 'select_account' });

    // Usamos 'this.auth' que inyectamos arriba
    signInWithPopup(this.auth, provider)
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
        alert('Error al iniciar sesión con Google.');
      });
  }
}
