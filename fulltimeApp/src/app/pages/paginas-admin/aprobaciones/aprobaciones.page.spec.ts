import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AprobacionesPage } from './aprobaciones.page';

describe('AprobacionesPage', () => {
  let component: AprobacionesPage;
  let fixture: ComponentFixture<AprobacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AprobacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
