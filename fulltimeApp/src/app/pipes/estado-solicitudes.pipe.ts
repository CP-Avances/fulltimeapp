import { Pipe, PipeTransform } from '@angular/core';
import { estadoSelectItems } from '../interfaces/Estados'
@Pipe({
  name: 'estadoSolicitudes'
})
export class EstadoSolicitudesPipe implements PipeTransform {

  transform(value: number): string {
    const [estado] = estadoSelectItems.filter(estado => { return estado.id === value });
    if (!estado) return value.toString()

    return estado.nombre;
  }

}
