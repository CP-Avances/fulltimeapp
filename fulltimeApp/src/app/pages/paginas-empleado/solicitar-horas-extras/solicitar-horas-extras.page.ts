import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-solicitar-horas-extras',
  templateUrl: './solicitar-horas-extras.page.html',
  styleUrls: ['./solicitar-horas-extras.page.scss'],
})
export class SolicitarHorasExtrasPage implements OnInit{

  constructor(
    public platform: Platform,
  ) {}

  ngOnInit(): void {
  }
}
