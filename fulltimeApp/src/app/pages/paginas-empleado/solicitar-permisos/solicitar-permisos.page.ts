import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-solicitar-permisos',
  templateUrl: './solicitar-permisos.page.html',
  styleUrls: ['./solicitar-permisos.page.scss'],
})
export class SolicitarPermisosPage  implements OnInit{

  constructor(
    public platform: Platform,
  ) {}

  ngOnInit(): void {
  }

}
