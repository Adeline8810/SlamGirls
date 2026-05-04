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

  signInWithPopup(this.auth, provider)
    .then((result) => {
      const user = result.user;
      const email = user.email || '';

      // 🔄 BUSCAMOS AL USUARIO EN TU BASE DE DATOS DE RENDER
      this.usuarioService.buscarPorEmail(email).subscribe({
        next: (userBD: any) => {
          // ✅ GUARDAMOS EL ID NUMÉRICO REAL (Ej: 10)
          localStorage.setItem('usuario', JSON.stringify(userBD));
          localStorage.setItem('usuarioId', userBD.id.toString());

          console.log('✅ Sincronizado con ID numérico:', userBD.id);
          this.router.navigate(['/inicio']);
        },
        error: (err) => {
          console.error('❌ El email no existe en la base de datos de Render:', err);
          alert('Tu cuenta de Google no está registrada. Por favor, regístrate primero.');
        }
      });
    })
    .catch((error) => {
      console.error('❌ Error Firebase:', error);
    });
}
}
