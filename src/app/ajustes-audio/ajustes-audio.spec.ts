import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjustesAudio } from './ajustes-audio';

describe('AjustesAudio', () => {
  let component: AjustesAudio;
  let fixture: ComponentFixture<AjustesAudio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjustesAudio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjustesAudio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
