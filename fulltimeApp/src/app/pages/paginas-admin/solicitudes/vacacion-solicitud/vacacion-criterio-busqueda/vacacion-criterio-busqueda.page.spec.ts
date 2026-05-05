import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VacacionCriterioBusquedaPage } from './vacacion-criterio-busqueda.page';

describe('VacacionCriterioBusquedaPage', () => {
  let component: VacacionCriterioBusquedaPage;
  let fixture: ComponentFixture<VacacionCriterioBusquedaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VacacionCriterioBusquedaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
