import { Component, OnInit } from '@angular/core';

interface Video {
  id: number;
  thumbnail: string;
  title: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  selectedTab: string = 'cover';

  videos: Video[] = [];

  constructor() {}

  ngOnInit(): void {
    //  this.videos = this.videoService.getVideos();
    // Simulación de videos (luego esto viene de un servicio)
    this.videos = [
      { id: 1, thumbnail: 'https://via.placeholder.com/150', title: 'Video 1' },
      { id: 2, thumbnail: 'https://via.placeholder.com/150', title: 'Video 2' },
      { id: 3, thumbnail: 'https://via.placeholder.com/150', title: 'Video 3' },
      { id: 4, thumbnail: 'https://via.placeholder.com/150', title: 'Video 4' }
    ];
  }

  changeTab(tab: string) {
    this.selectedTab = tab;
  }
}
