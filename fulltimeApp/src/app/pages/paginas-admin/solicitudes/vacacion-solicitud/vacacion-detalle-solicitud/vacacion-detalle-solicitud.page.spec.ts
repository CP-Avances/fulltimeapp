import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VacacionDetalleSolicitudPage } from './vacacion-detalle-solicitud.page';

describe('VacacionDetalleSolicitudPage', () => {
  let component: VacacionDetalleSolicitudPage;
  let fixture: ComponentFixture<VacacionDetalleSolicitudPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VacacionDetalleSolicitudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
