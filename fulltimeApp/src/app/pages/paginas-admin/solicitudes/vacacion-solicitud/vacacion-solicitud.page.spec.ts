import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VacacionSolicitudPage } from './vacacion-solicitud.page';

describe('VacacionSolicitudPage', () => {
  let component: VacacionSolicitudPage;
  let fixture: ComponentFixture<VacacionSolicitudPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VacacionSolicitudPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VacacionSolicitudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
