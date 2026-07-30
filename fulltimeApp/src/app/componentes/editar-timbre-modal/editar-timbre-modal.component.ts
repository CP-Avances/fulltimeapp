import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';

import { TimbresService } from 'src/app/services/timbres.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';

@Component({
  selector: 'app-editar-timbre-modal',
  templateUrl: './editar-timbre-modal.component.html',
  styleUrls: ['./editar-timbre-modal.component.scss'],
})
export class EditarTimbreModalComponent implements OnInit {

  @Input() timbre: any;

  datosTimbre: any;

  EditartimbreForm!: FormGroup;

  enviando = false;

  formato_fecha = 'dd/MM/yyyy';
  formato_hora = 'HH:mm:ss';
  idioma_fechas = 'es';

  observacion = '';
  simbolo_ = '';

  seleccion: any;
  envio_accion = '';

  // LISTA DE ACCIONES DE TIMBRES
  acciones: any[] = [
    { value: '0', item: 'E', text: 'Entrada' },
    { value: '1', item: 'S', text: 'Salida' },
    { value: '2', item: 'I/A', text: 'Inicio alimentación' },
    { value: '3', item: 'F/A', text: 'Fin alimentación' },
    { value: '4', item: 'I/P', text: 'Inicio permiso' },
    { value: '5', item: 'F/P', text: 'Fin permiso' },
    { value: '7', item: 'HA', text: 'Timbre libre' },
    { value: '99', item: 'D', text: 'Desconocido' },
  ];

  constructor(
    private readonly timbreServicio: TimbresService,
    private readonly formBuilder: FormBuilder,
    private readonly validar: ValidacionesService,
    private readonly toastController: ToastController,
    private readonly modalController: ModalController,
    public parametro: ParametrosService,
  ) { }

  ngOnInit() {
    this.BuscarParametro();
  }

  // ============================================================
  // PARÁMETROS DE FECHA / HORA
  // ============================================================

  BuscarParametro() {
    const detalles = [
      ParametrosSistema.FORMATO_FECHA,
      ParametrosSistema.FORMATO_HORA
    ];

    this.parametro.ObtenerFormatos(detalles).subscribe({
      next: (res: any[]) => {
        res.forEach((p: any) => {
          if (p.id_parametro === ParametrosSistema.FORMATO_FECHA) {
            this.formato_fecha = p.descripcion;
          }

          if (p.id_parametro === ParametrosSistema.FORMATO_HORA) {
            this.formato_hora = p.descripcion;
          }
        });

        this.LeerDatosTimbre();
      },
      error: () => {
        this.LeerDatosTimbre();
      }
    });
  }

  // ============================================================
  // LEER DATOS DEL TIMBRE
  // ============================================================

  LeerDatosTimbre() {
    this.datosTimbre = this.timbre;

    if (!this.datosTimbre) {
      this.crearFormularioVacio();
      return;
    }

    const fechaTimbre =
      this.datosTimbre.fecha_hora_timbre_validado ??
      this.datosTimbre.fecha_hora_timbre ??
      this.datosTimbre.fecha_hora_timbre_servidor ??
      '';

    if (fechaTimbre && String(fechaTimbre).includes(' ')) {
      const partes = String(fechaTimbre).split(' ');
      const fechaParte = partes[0];
      const horaParte = partes[1];

      try {
        const fechaFormato = this.validar.DarFormatoFecha(fechaParte, 'yyyy-MM-dd');

        this.datosTimbre.fecha_ = this.validar.FormatearFecha(
          fechaFormato,
          this.formato_fecha,
          this.validar.dia_abreviado
        );

        this.datosTimbre.hora_ = this.validar.FormatearHora(
          horaParte,
          this.formato_hora
        );
      } catch {
        this.datosTimbre.fecha_ = this.datosTimbre.fecha ?? fechaParte;
        this.datosTimbre.hora_ = this.datosTimbre.hora ?? horaParte;
      }
    } else {
      this.datosTimbre.fecha_ = this.datosTimbre.fecha ?? '';
      this.datosTimbre.hora_ = this.datosTimbre.hora ?? '';
    }

    this.ValidarObservacion();

    this.acciones.forEach((elementAccion: any) => {
      if (elementAccion.item == this.datosTimbre.accion) {
        this.seleccion = elementAccion.value;
      }
    });

    this.EditartimbreForm = this.formBuilder.group({
      accionTimbre: [this.seleccion, Validators.required],
      ObservacionForm: [this.observacion]
    });

  }

  crearFormularioVacio() {
    this.EditartimbreForm = this.formBuilder.group({
      accionTimbre: ['', Validators.required],
      ObservacionForm: ['']
    });
  }

  // ============================================================
  // VALIDAR OBSERVACIÓN
  // ============================================================

  ValidarObservacion() {
    const cadena = String(this.datosTimbre?.observacion ?? '');
    const patron = /Timbre creado por/;
    const simbolo = '/';

    this.simbolo_ = '';

    if (patron.test(cadena) && cadena.includes(simbolo)) {
      this.observacion = cadena.slice(cadena.indexOf(simbolo) + 1).trim();

      const indice = cadena.indexOf(simbolo);
      this.simbolo_ = cadena.substring(0, indice).trim() + ' / ';
      return;
    }

    if (patron.test(cadena)) {
      this.observacion = '';
      this.simbolo_ = cadena + ' / ';
      return;
    }

    this.observacion = cadena;
  }

  // ============================================================
  // ACTUALIZAR TIMBRE
  // ============================================================

  EnviarDatosTimbre(formTimbre: any) {
    if (this.EditartimbreForm.invalid) {
      this.EditartimbreForm.markAllAsTouched();

      this.mostrarToast(
        'Complete la acción y tecla función.',
        'warning'
      );

      return;
    }

    if (!this.datosTimbre?.id) {
      this.mostrarToast(
        'No se encontró el identificador del timbre.',
        'danger'
      );

      return;
    }

    const fechaTimbre =
      this.datosTimbre.fecha_hora_timbre_validado ??
      this.datosTimbre.fecha_hora_timbre ??
      this.datosTimbre.fecha_hora_timbre_servidor;

    const observacionForm = String(
      formTimbre.ObservacionForm ?? ''
    ).trim();

    const data = {
      id: this.datosTimbre.id,
      codigo: this.datosTimbre.codigo,
      tecla: formTimbre.accionTimbre,

      observacion: observacionForm
        ? this.simbolo_ + observacionForm
        : this.simbolo_.trim(),

      fecha: fechaTimbre,
    };

    this.enviando = true;

    this.timbreServicio
      .EditarTimbreEmpleado(data)
      .subscribe({
        next: async () => {
          this.enviando = false;

          await this.mostrarToast(
            'Registros actualizados.',
            'success'
          );

          await this.modalController.dismiss({
            actualizado: true
          });
        },

        error: async (error) => {
          this.enviando = false;

          console.log('Error al editar timbre:', error);

          if (error.status === 409) {
            const mensajeBackend = String(
              error?.error?.message ?? ''
            ).trim();

            const detalleBackend = String(
              error?.error?.detalle ?? ''
            ).trim();

            const mensaje =
              detalleBackend ||
              (
                mensajeBackend &&
                  mensajeBackend !== 'Ha ocurrido un error'
                  ? mensajeBackend
                  : 'Ya existe un timbre con la acción seleccionada. Primero asigne al timbre existente su acción correcta y vuelva a intentarlo.'
              );

            await this.mostrarToast(
              mensaje,
              'warning'
            );

            /*
             * Se cierra porque el usuario debe corregir
             * primero otro timbre.
             */
            await this.modalController.dismiss({
              actualizado: false
            });

            return;
          }

          const mensajeBackend = String(
            error?.error?.detalle ??
            error?.error?.message ??
            ''
          ).trim();

          const mensaje =
            mensajeBackend &&
              mensajeBackend !== 'Ha ocurrido un error'
              ? mensajeBackend
              : 'No se pudo actualizar el timbre.';

          await this.mostrarToast(
            mensaje,
            'danger'
          );

          await this.modalController.dismiss({
            actualizado: false
          });
        }
      });
  }

  cerrar() {
    this.modalController.dismiss({
      actualizado: false
    });
  }

  async mostrarToast(
    mensaje: string,
    color: 'success' | 'warning' | 'danger' | 'primary' = 'primary'
  ) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color,
      position: 'middle',
      mode: 'ios'
    });

    await toast.present();
  }
}