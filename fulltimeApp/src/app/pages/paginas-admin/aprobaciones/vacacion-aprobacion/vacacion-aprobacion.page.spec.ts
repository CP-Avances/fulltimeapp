import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VacacionAprobacionPage } from './vacacion-aprobacion.page';

describe('VacacionAprobacionPage', () => {
  let component: VacacionAprobacionPage;
  let fixture: ComponentFixture<VacacionAprobacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VacacionAprobacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
