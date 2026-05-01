import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarmakerLyrics } from './starmaker-lyrics';

describe('StarmakerLyrics', () => {
  let component: StarmakerLyrics;
  let fixture: ComponentFixture<StarmakerLyrics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarmakerLyrics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarmakerLyrics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
