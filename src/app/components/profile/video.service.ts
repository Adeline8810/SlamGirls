import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private videos: any[] = [];

  addVideo(video: any) {
    this.videos.push(video);
  }

  getVideos() {
    return this.videos;
  }
}
