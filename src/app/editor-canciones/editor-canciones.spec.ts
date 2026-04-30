import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorCanciones } from './editor-canciones';

describe('EditorCanciones', () => {
  let component: EditorCanciones;
  let fixture: ComponentFixture<EditorCanciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorCanciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorCanciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
