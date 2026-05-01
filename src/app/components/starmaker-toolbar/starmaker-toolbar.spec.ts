import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarmakerToolbar } from './starmaker-toolbar';

describe('StarmakerToolbar', () => {
  let component: StarmakerToolbar;
  let fixture: ComponentFixture<StarmakerToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarmakerToolbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarmakerToolbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
