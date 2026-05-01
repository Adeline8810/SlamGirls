import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarmakerPlayer } from './starmaker-player';

describe('StarmakerPlayer', () => {
  let component: StarmakerPlayer;
  let fixture: ComponentFixture<StarmakerPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarmakerPlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarmakerPlayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
