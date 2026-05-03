import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { Router } from '@angular/router';

import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth'; // Añade Auth aquí


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule]
})
export class LoginComponent {

  form: any;
  // 1. La declaramos aquí arriba, limpia.


  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private httpAuth: Auth
  ) {
    // 2. La inyectamos aquí adentro. Esto es lo más seguro.


    // 3. Inicializamos el formulario
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }



  submit() {
    if (this.form.invalid) return;

    const username = this.form.value.username || '';
    const password = this.form.value.password || '';

    this.usuarioService.login(username, password).subscribe({
      next: (u) => {
        // 1. Guardamos la info del usuario
        localStorage.setItem('usuario', JSON.stringify(u));

        // 2. Guardamos el ID (Super importante para el Live)
        if (u && u.id) {
          localStorage.setItem('usuarioId', u.id.toString());
        }

        // 3. REVISAMOS A DÓNDE IR:
        if (u?.username === 'ruthadeline') {
          this.router.navigate(['/admin']);
        } else {
          // CAMBIA ESTO: De '/' a '/inicio'
          this.router.navigate(['/inicio']);
        }
      },
      error: () => {
        alert('Usuario o contraseña incorrectos');
      }
    });
  }


loginConGoogle() {
  signInWithPopup(this.httpAuth, new GoogleAuthProvider())
    .then((result) => {
      const user = result.user;
      localStorage.setItem('usuario', JSON.stringify({
        username: user.displayName,
        email: user.email,
        id: user.uid
      }));
      this.router.navigate(['/inicio']);
    })
    .catch((error) => console.error(error));
}


}
