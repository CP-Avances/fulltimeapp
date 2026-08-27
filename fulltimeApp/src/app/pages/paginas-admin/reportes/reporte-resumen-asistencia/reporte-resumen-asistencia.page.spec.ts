import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReporteResumenAsistenciaPage } from './reporte-resumen-asistencia.page';

describe('ReporteResumenAsistenciaPage', () => {
  let component: ReporteResumenAsistenciaPage;
  let fixture: ComponentFixture<ReporteResumenAsistenciaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteResumenAsistenciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
