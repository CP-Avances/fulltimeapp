import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarPermisoPage } from './registrar-permiso.page';

describe('RegistrarPermisoPage', () => {
  let component: RegistrarPermisoPage;
  let fixture: ComponentFixture<RegistrarPermisoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarPermisoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
