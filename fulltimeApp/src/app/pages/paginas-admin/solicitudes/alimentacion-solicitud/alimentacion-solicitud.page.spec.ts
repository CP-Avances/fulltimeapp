import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AlimentacionSolicitudPage } from './alimentacion-solicitud.page';

describe('AlimentacionSolicitudPage', () => {
  let component: AlimentacionSolicitudPage;
  let fixture: ComponentFixture<AlimentacionSolicitudPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AlimentacionSolicitudPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AlimentacionSolicitudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
