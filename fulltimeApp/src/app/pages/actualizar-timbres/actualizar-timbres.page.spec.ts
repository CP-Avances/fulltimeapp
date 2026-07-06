import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActualizarTimbresPage } from './actualizar-timbres.page';

describe('ActualizarTimbresPage', () => {
  let component: ActualizarTimbresPage;
  let fixture: ComponentFixture<ActualizarTimbresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualizarTimbresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
