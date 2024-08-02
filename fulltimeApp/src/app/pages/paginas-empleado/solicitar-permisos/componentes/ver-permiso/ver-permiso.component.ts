import { Component, Input, OnInit } from '@angular/core';
import { Permiso } from '../../../../../interfaces/Permisos';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ver-permiso',
  templateUrl: './ver-permiso.component.html',
  styleUrls: ['../../solicitar-permisos.page.scss'],
})
export class VerPermisoComponent implements OnInit {

  @Input() permiso: any;


  public codigo: string = ''; // Variable para almacenar el código
  hipervinculo: string = 'http://192.168.0.107:3001';
  file: any;


  constructor(private empleadosService: EmpleadosService) { }

  ngOnInit() {
    this.file = this.permiso.documento;
    console.log(this.permiso.documento);
    this.obtenerCodigo(this.permiso.id_empleado);
  }


  public obtenerCodigo(id: number) {
    this.empleadosService.BuscarUnEmpleado(id).subscribe(x => {
      this.codigo = x[0].codigo
      console.log("ver codigo", x[0].codigo)

    })
  }



}
