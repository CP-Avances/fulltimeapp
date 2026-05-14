import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermisoCriterioBusquedaPage } from './permiso-criterio-busqueda.page';

describe('PermisoCriterioBusquedaPage', () => {
  let component: PermisoCriterioBusquedaPage;
  let fixture: ComponentFixture<PermisoCriterioBusquedaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PermisoCriterioBusquedaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
