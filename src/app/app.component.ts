import { Component, OnInit } from '@angular/core'; // Te faltaba el OnInit aquí
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importaciones necesarias

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HttpClientModule], // Agrega HttpClientModule aquí
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class AppComponent implements OnInit { // Ahora sí reconoce el OnInit

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Mandamos el "codazo" al servidor apenas carga la app
    this.http.get('https://backend-ruth-slam.onrender.com/api/usuarios/ping')
      .subscribe({
        next: () => console.log("✅ Servidor despertado con éxito"),
        error: () => console.log("⏳ El servidor está despertando... espera unos segundos")
      });
  }
}
