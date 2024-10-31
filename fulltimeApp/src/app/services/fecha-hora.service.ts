import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment-timezone';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class FechaHoraService {
  private fechaHoraSubject = new BehaviorSubject(this.obtenerFechaActual());

  constructor() {
      this.actualizarFechaHora();
  }

  // METODO PARA OBTENER LA FECHA DEL DISPOSITIVO Y LA ZONA HORARIA
  async obtenerFechaActual() {
    const fechaActual = DateTime.local();
    const zonaHoraria = fechaActual.zoneName; // Nombre de la zona horaria

    // Obtener los componentes de la fecha (año, mes y día)
    const anio = fechaActual.year;
    const mes = fechaActual.toFormat('MM');
    const dia = fechaActual.toFormat('dd');

    // Obtener los componentes de la hora (hora, minutos y segundos)
    const hora = fechaActual.toFormat('HH');
    const minutos = fechaActual.toFormat('mm');
    const segundos = fechaActual.toFormat('ss');

    // Formatear la fecha y hora en el formato requerido
    const fechaFormateada = `${anio}-${mes}-${dia}`;
    const horaFormateada = `${hora}:${minutos}:${segundos}`;

    // Devolver un objeto con la fecha y hora y la zona horaria
    return {
      fechaHora: `${fechaFormateada} ${horaFormateada}`,
      fecha: fechaFormateada,
      hora: horaFormateada,
      zonaHoraria: zonaHoraria,
    };
  }

  // METODO PARA ACTUALIZAR EL RELOJ
  private actualizarFechaHora() {
    setInterval(() => {
      this.fechaHoraSubject.next(this.obtenerFechaActual());
    }, 1000); // Actualizar cada segundo
  }

  get fechaHora$() {
    return this.fechaHoraSubject.asObservable();
  }



}
