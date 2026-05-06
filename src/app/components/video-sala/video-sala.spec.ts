import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoSala } from './video-sala';

describe('VideoSala', () => {
  let component: VideoSala;
  let fixture: ComponentFixture<VideoSala>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoSala]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoSala);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
