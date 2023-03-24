import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { HorarioE } from '../interfaces/Horarios';
import { Cg_Feriados } from '../interfaces/Catalogos';

import moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class ValidacionesService {

    constructor(
        private toastController: ToastController,
    ) { }

    vacio(dato: any) {
        if (dato === undefined || dato === null || dato === '') {
            return true;
        } else {
            return false;
        }
    }

    validarRangoFechasIngresa(fechaInicio: Date | string, fechaFinal: Date | string, fechasIguales = false): Boolean {

        const f_inicio_aux = new Date(fechaInicio)
        const f_final_aux = new Date(fechaFinal)
        const fec_inicio = new Date(f_inicio_aux.toJSON().split("T")[0])
        const fec_final = new Date(f_final_aux.toJSON().split("T")[0])

        if (fec_inicio.valueOf() > fec_final.valueOf()) {
            this.showToast('La fecha de inicio no puede ser mayor a la fecha final de consulta', 3000, "danger")
            return false
        }

        if (!fechasIguales) {
            if (fec_inicio.valueOf() === fec_final.valueOf()) {
                this.showToast('La fecha de inicio no puede ser igual a la fecha final de consulta', 3000, "danger")
                return false
            }
        }

        return true;
    }

    validarHorasIngresadas(horaInicio: Date, horaFinal: Date, horasIguales = false): Boolean {

        if (moment(horaInicio).format('YYYY-MM-DDTHH:mm') > moment(horaFinal).format('YYYY-MM-DDTHH:mm')) {
            this.showToast('La hora de Inicio no puede ser MAYOR a la hora Final', 3000, "warning")
            return false
        }
        if (horasIguales === false) {
            if (moment(horaInicio).format('YYYY-MM-DDTHH:mm') === moment(horaFinal).format('YYYY-MM-DDTHH:mm')) {
                this.showToast('La hora de Inicio no puede ser IGUAL a la hora Final', 3000, "warning")
                return false
            }
        }

        return true
    }

    /**
     * Metodo para unir fecha y hora de inputs diferentes  
     * @param fecha Fecha que proviene de la etiqueta <ion-datetime></ion-datetime>
     * @param hora Hora en formato string 'HH:mm:ss' = '00:00:00'
     * @returns 
     */
    Unir_Fecha_Hora(fecha: string, hora: string): Date {
        // EJEMPLO
        // fecha: '2021-07-30T16:26:03.822-05:00'
        // hora: '15:25:03'
        const fec = fecha.toString()
        return new Date(fec.split('T')[0] + 'T' + hora)
    }

    Unir_Fecha_Hora_HE(fecha: String, hora: string): Date {
        // EJEMPLO
        // fecha: '2021-07-30T16:26:03.822-05:00'
        // hora: '15:25:03'
        const fec = fecha.toString()
        return new Date(fec.split('T')[0] + 'T' + hora)
    }

    MilisegToSegundos(miliseg: number) {
        return miliseg / 1000
    }

    TiempoFormatoHHMMSS(hora: string): string {
        return hora.split('.')[0].split("T")[1]
    }

    HorasTrabajaToSegundos(hora: string): number {
        if (hora === '') return 0
        var h = parseInt(hora) * 3600;
        return h
    }

    HHMMSStoSegundos(dato: any): number {
        if (dato === '') return 0
        if (dato === null) return 0
        // if (dato === 0) return 0
        // console.log(dato);
        var h = parseInt(dato.split(':')[0]) * 3600;
        var m = parseInt(dato.split(':')[1]) * 60;
        var s = parseInt(dato.split(':')[2]);
        console.log(h, '>>>>>', m);
        return h + m + s
    }

    SegundosToHHMM(dato: number): string {
        var h = Math.floor(dato / 3600);
        var m = Math.floor((dato % 3600) / 60);
        var s = dato % 60;
        if (h <= -1) {
            return '00:00:00'
        }
        let hora = (h >= 10) ? h : '0' + h;
        let min = (m >= 10) ? m : '0' + m;
        let seg = (s >= 10) ? s : '0' + s;

        return hora + ':' + min + ':' + seg
    }

    //SegundosTransformDiaLaboral( inicio: Date, final: Date, tiempo_total: number, horario: HorarioE, horas_trabaja: number): any {
    //inicio = hora_inicio / final = hora_final
    SegundosTransformDiaLaboral(inicio: string, final: string, tiempo_total: number, totalHorar: number, horario: HorarioE, horas_trabaja: number, feriado: Cg_Feriados[] ): any {

        //Condicion para calcular horas de permiso tomando simepre un dia de permiso
        if (tiempo_total <= horas_trabaja) { // validacion para permisos de un mismo dia laboral 
            console.log('----Horas----');
            let tiempo_transcurrido_horas =  this.SegundosToHHMM(tiempo_total);
            console.log('horas: ',tiempo_transcurrido_horas);
            
            return {
                dia: 0,
                tiempo_transcurrido: tiempo_transcurrido_horas,
                dia_libre: 0,
            }
        }

        //Condicion para calcular los dias de permiso 
        if (tiempo_total % 86400 === 0) { // logica para comprovar si el tiempo ingresado solo son dias de 24 horas exactos tomando en cuenta que la hora final es igual a la de inicio.
            
            console.log('----Dias----');
            //logica de validacion de dias laborales y libres.
            const { dia_laborable, dia_libre } = this.vacacionesByFeriadoAndHorarioE(inicio, final, horario, feriado);
            console.log('Dias: ', dia_laborable, ' Dias Libres: ',dia_libre);
            return {
                dia: dia_laborable,
                tiempo_transcurrido: this.SegundosToHHMM(tiempo_total),// el tiempo es 00:00:00
                dia_libre: dia_libre
            }

        } else {// para unir calculo de dias y horas

             //const d = (Math.floor(tiempo_total / 86400)) + 1; //Esto ya no va por que se usa el metodo de vacaciones
            console.log('----Dias y Horas----');
            const { dia_laborable, dia_libre } = this.vacacionesByFeriadoAndHorarioE(inicio, final, horario, feriado);
            let tiempotranscurrido_horas = '00:00:00';

            tiempotranscurrido_horas =  this.SegundosToHHMM(totalHorar);
            console.log('Dias: ', dia_laborable - 1,' horas: ',tiempotranscurrido_horas);

            return {
                dia: dia_laborable - 1,
                tiempo_transcurrido: tiempotranscurrido_horas,
                dia_libre: dia_libre
            }
        }
    }

    // METODO PARA CALCULAR LOS DIAS DE VACACIONES 
    vacacionesByFeriadoAndHorarioE(inicio: string, final: string, horario: HorarioE, feriado: Cg_Feriados[]): any {

        const fec_aux = new Date(inicio.split('T')[0])//variable auxiliar de la fecha de inicio, me toma un dia anterior.

        const fecha1 = moment(inicio);
        const fecha2 = moment(final);
        let diaslibre = 0;

        const diasDiferencia = fecha2.diff(fecha1, 'days');//variable de los dias de diferencia que hay entre el dia final y el inicial

        let res: Array<any> = [];
        // se aplica logica matematica
        for (let i = 0; i <= diasDiferencia; i++) {
            const fec_string = fec_aux.toJSON().split('T')[0];
            const [fer] = feriado.filter(o => { return o.fecha === fec_string })       

            let horario_laboral = {
                fecha: fec_string,
                labora: this.ObtenerDiaLabora(horario, fec_aux.getUTCDay()),
                feriado: (fer) ? 0 : 1 // 0 = hay feriado | 1 = no hay feriado
            }
            res.push(horario_laboral)
            fec_aux.setDate(fec_aux.getDate() + 1)
            diaslibre = horario_laboral.labora;
        }

        const labora = res.filter(o => { return 1 === (o.labora * o.feriado) })
        const libre = res.filter(o => { return 0 === (o.labora * o.feriado) })

        return {
            dia_laborable: labora.length,
            dia_libre: libre.length
        }

    }

    validarDiaLaboral_Libre(dia: string, horario: HorarioE, feriado: Cg_Feriados[]): any {
        const fec_aux = new Date(dia.split('T')[0])//variable auxiliar de la fecha de inicio, me toma un dia anterior.
        const fec_string = fec_aux.toJSON().split('T')[0];
        const [fer] = feriado.filter(o => { return o.fecha === fec_string })  

        let horario_laboral = {
            fecha: fec_string,
            labora: this.ObtenerDiaLabora(horario, fec_aux.getUTCDay()),
            feriado: (fer) ? 0 : 1 // 0 = hay feriado | 1 = no hay feriado
        }

        return horario_laboral.labora
    }

   ObtenerDiaLabora(horario: HorarioE, dia: number): number {
        let bool_return = undefined;
        switch (dia) { // true = no labora | false = labora
            case 0: bool_return = horario.domingo; break;
            case 1: bool_return = horario.lunes; break;
            case 2: bool_return = horario.martes; break;
            case 3: bool_return = horario.miercoles; break;
            case 4: bool_return = horario.jueves; break;
            case 5: bool_return = horario.viernes; break;
            case 6: bool_return = horario.sabado; break;
            default:
                bool_return = undefined
                break;
        }

        return (bool_return) ? 0 : 1 // 0 = no labora | 1 = labora
    }

    CalcularHorasExtrasTotales(tiempo_total: number): any {

        return {
            tiempo_transcurrido: this.SegundosToHHMM(tiempo_total),
        }
    }



    async showToast(mensaje: string, duracion: number, color: string) {

        const toast = await this.toastController.create({
            message: mensaje,
            duration: duracion,
            color: color,
            mode: 'ios',
            cssClass: 'showtoast-custom-class'
        });
        toast.present();
    }

    async abrirToas(mensaje: string, duracion: number, color: string, position: any) {
        const toast = await this.toastController.create({
            message: mensaje,
            duration: duracion,
            color: color,
            position: position,
            mode: 'ios',
            cssClass: 'toast-custom-class',
        });
        toast.present();
    }

    dia_abreviado: string = 'ddd';
    dia_completo: string = 'dddd';
  
    FormatearFecha(fecha: string, formato: string, dia: string) {
      let valor = moment(fecha).format(dia).charAt(0).toUpperCase() +
        moment(fecha).format(dia).slice(1) +
        ', ' + moment(fecha).format(formato);
      return valor;
    }
  
    FormatearHora(hora: string, formato: string) {
      let valor = moment(hora, 'HH:mm:ss').format(formato);
      return valor;
    }
}
