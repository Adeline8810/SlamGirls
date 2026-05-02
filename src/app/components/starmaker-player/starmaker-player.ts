import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Útil para tener en Standalone

@Component({
  selector: 'app-starmaker-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './starmaker-player.html',
  styleUrls: ['./starmaker-player.css']
})
export class StarmakerPlayer {
  @Input() videoUrl: string = ''; // Ahora esto ya no tendrá la línea roja
}
