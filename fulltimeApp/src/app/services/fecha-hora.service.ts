import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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
    const zonaHoraria = fechaActual.zoneName;

    // OBTENER GMT DEL DISPOSITIVO
    const gmtMinutos = new Date().getTimezoneOffset();

    // getTimezoneOffset devuelve el signo invertido.
    // Ecuador normalmente devuelve 300, por eso se multiplica por -1.
    const offsetMinutos = -gmtMinutos;

    const signo = offsetMinutos >= 0 ? '+' : '-';
    const horasOffset = Math.floor(Math.abs(offsetMinutos) / 60);
    const minutosOffset = Math.abs(offsetMinutos) % 60;

    const gmtDispositivo = minutosOffset === 0
      ? `GMT${signo}${horasOffset}`
      : `GMT${signo}${horasOffset}:${String(minutosOffset).padStart(2, '0')}`;

    // Obtener los componentes de la fecha
    const anio = fechaActual.year;
    const mes = fechaActual.toFormat('MM');
    const dia = fechaActual.toFormat('dd');

    // Obtener los componentes de la hora
    const hora = fechaActual.toFormat('HH');
    const minutos = fechaActual.toFormat('mm');
    const segundos = fechaActual.toFormat('ss');

    // Formatear la fecha y hora
    const fechaFormateada = `${anio}-${mes}-${dia}`;
    const horaFormateada = `${hora}:${minutos}:${segundos}`;

    // Devolver un objeto con fecha, hora, zona horaria y GMT
    return {
      fechaHora: `${fechaFormateada} ${horaFormateada}`,
      fecha: fechaFormateada,
      hora: horaFormateada,
      zonaHoraria: zonaHoraria,
      gmtDispositivo: gmtDispositivo,
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
