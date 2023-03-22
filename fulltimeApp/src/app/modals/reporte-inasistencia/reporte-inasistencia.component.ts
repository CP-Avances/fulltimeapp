import { Component, OnInit, Input } from '@angular/core';
import { ReportesService } from '../../services/reportes.service';
import { ModalController } from '@ionic/angular';
import { DataUserLoggedService } from '../../services/data-user-logged.service';

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

@Component({
  selector: 'app-reporte-inasistencia',
  templateUrl: './reporte-inasistencia.component.html',
  styleUrls: ['../reportes.component.scss'],
})
export class ReporteInasistenciaComponent implements OnInit {

  @Input() data: any;

  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }

  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }

  alimentacion: any = [];

  showBtnPdf: boolean = false;
  loading: boolean = true;

  constructor(
    private reporteService: ReportesService,
    public modalController: ModalController,
    private dataUserService: DataUserLoggedService,
  ) { }

  ngOnInit() {
    console.log('reporte inasistencia | Data empleado: ', this.data);
  }

  consultarDataReporte() {
    console.log('generar reporte...');
    console.log(this.fechaFinal);
    console.log(this.fechaInicio);
    // this.loading = false;
    // this.reporteService.getInfoReporteTimbres(this.data.codigo, this.fechaInicio, this.fechaFinal).subscribe(res => {
    //   this.alimentacion = res;
    //   this.showBtnPdf = true;
    //   this.loading = true;
    // }, err => {
    //   this.showBtnPdf = false;
    //   this.loading = true;
    //   console.log(err);
    //   this.reporteService.abrirToas(err.error.message, 'danger', 3000)
    // })

  }

  generarPDF() {
  }

  closeModal() {
    console.log('CERRAR MODAL Reporte timbre');
    this.modalController.dismiss({
      'refreshInfo': true
    });
  }

}
