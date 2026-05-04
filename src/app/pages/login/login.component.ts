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

        // 1. Guardamos datos de Google por si acaso
        localStorage.setItem('usuario', JSON.stringify({
          username: user.displayName,
          email: user.email,
          id: user.uid
        }));

        // 2. Buscamos el ID numérico en tu base de datos
        // Usamos (any) para evitar el error de la línea roja en u.id
        this.usuarioService.login(user.email || '', '').subscribe({
          next: (u: any) => {
            if (u && u.id) {
              // GUARDAMOS EL ID NUMÉRICO (Esto arregla tus videos)
              localStorage.setItem('usuarioId', u.id.toString());
              localStorage.setItem('usuario', JSON.stringify(u));
            }
            console.log('✅ Login sincronizado');
            this.router.navigate(['/inicio']);
          },
          error: () => {
            console.log('⚠️ No se encontró en BD, entrando solo con Google');
            this.router.navigate(['/inicio']);
          }
        });
      })
      .catch((error) => {
        console.error('❌ Error Auth:', error);
        alert('Error al iniciar sesión con Google.');
      });
  }
}
