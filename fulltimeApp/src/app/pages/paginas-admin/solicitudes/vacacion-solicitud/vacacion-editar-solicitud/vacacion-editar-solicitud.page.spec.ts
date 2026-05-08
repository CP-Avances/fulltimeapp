import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VacacionEditarSolicitudPage } from './vacacion-editar-solicitud.page';

describe('VacacionEditarSolicitudPage', () => {
  let component: VacacionEditarSolicitudPage;
  let fixture: ComponentFixture<VacacionEditarSolicitudPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VacacionEditarSolicitudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
