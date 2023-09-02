import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PermisoSolicitudPage } from './permiso-solicitud.page';

describe('PermisoSolicitudPage', () => {
  let component: PermisoSolicitudPage;
  let fixture: ComponentFixture<PermisoSolicitudPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PermisoSolicitudPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PermisoSolicitudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
