import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermisoAprobacionPage } from './permiso-aprobacion.page';

describe('PermisoAprobacionPage', () => {
  let component: PermisoAprobacionPage;
  let fixture: ComponentFixture<PermisoAprobacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PermisoAprobacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
