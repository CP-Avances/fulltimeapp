import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment-timezone';

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
    let fechaActual = moment();
    let zonaHoraria = moment.tz.guess(true);
    // OBTENER LOS COMPONENTES DE LA FECHA (AÑO, MES Y DÍA)
    const anio = fechaActual.year();
    const mes = fechaActual.format('MM');
    const dia = fechaActual.format('DD');
    // OBTENER LOS COMPONENTES DE LA HORA (HORA, MINUTOS Y SEGUNDOS)
    const hora = fechaActual.format('HH');
    const minutos = fechaActual.format('mm');
    const segundos = fechaActual.format('ss');
    // FORMATEAR LA FECHA Y HORA EN EL FORMATO REQUERIDO
    const fechaFormateada = `${anio}-${mes}-${dia}`;
    const horaFormateada = `${hora}:${minutos}:${segundos}`;
    // DEVOLVER UN OBJETO CON LA FECHA Y HORA Y LA ZONA HORARIA
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
