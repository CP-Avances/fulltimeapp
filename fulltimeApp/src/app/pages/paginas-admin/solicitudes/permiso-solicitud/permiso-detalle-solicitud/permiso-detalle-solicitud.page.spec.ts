import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermisoDetalleSolicitudPage } from './permiso-detalle-solicitud.page';

describe('PermisoDetalleSolicitudPage', () => {
  let component: PermisoDetalleSolicitudPage;
  let fixture: ComponentFixture<PermisoDetalleSolicitudPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PermisoDetalleSolicitudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
