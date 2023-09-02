import { Component, Input, OnInit } from '@angular/core';
import { Permiso } from '../../../../../interfaces/Permisos';

@Component({
  selector: 'app-ver-permiso',
  templateUrl: './ver-permiso.component.html',
  styleUrls: ['../../solicitar-permisos.page.scss'],
})
export class VerPermisoComponent implements OnInit{

  @Input() permiso: Permiso;
  hipervinculo: string = 'http://192.168.0.193:3001';
  file: any;

  constructor() { }
  ngOnInit(): void {
    this.file = this.permiso.documento;
    console.log(this.permiso.documento);
  }
}
