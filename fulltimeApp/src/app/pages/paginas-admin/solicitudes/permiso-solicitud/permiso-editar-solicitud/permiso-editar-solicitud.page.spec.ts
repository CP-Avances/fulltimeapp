import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermisoEditarSolicitudPage } from './permiso-editar-solicitud.page';

describe('PermisoEditarSolicitudPage', () => {
  let component: PermisoEditarSolicitudPage;
  let fixture: ComponentFixture<PermisoEditarSolicitudPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PermisoEditarSolicitudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
