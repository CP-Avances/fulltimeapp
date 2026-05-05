import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarVacacionPage } from './registrar-vacacion.page';

describe('RegistrarVacacionPage', () => {
  let component: RegistrarVacacionPage;
  let fixture: ComponentFixture<RegistrarVacacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarVacacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
