import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { HorarioE } from '../interfaces/Horarios';
import { Cg_Feriados } from '../interfaces/Catalogos';
import { DateTime } from 'luxon';
import { EmpleadosService } from '../services/empleados.service';

@Injectable({
    providedIn: 'root'
})
export class ValidacionesService {

    constructor(
        private toastController: ToastController,
        public empleadoService: EmpleadosService,
        public alertCrtl: AlertController,
    ) { }

    dia_abreviado: string = 'ccc';
    dia_completo: string = 'cccc';

    // METODO PARA FORMATEAR LA FECHA
    FormatearFecha(fecha: string, formato: string, dia: string) {
        const fechaLuxon = DateTime.fromISO(fecha).setLocale("es");
        const diaFormateado = fechaLuxon.toFormat(dia);

        // Capitaliza la primera letra del día y combina con el formato de fecha
        const valor = diaFormateado.charAt(0).toUpperCase() +
            diaFormateado.slice(1) +
            ', ' + fechaLuxon.toFormat(formato);
        return valor;
    }
    // METODO PARA FORMATEAR LA FECHA CONSIDERANDO LA ZONA HORARIA DEL DISPOSITIVO
    FormatearFechaZonaHoraria(fecha: string, formato: string, dia: string, zonaHoraria: string) {
        const fechaLuxon = DateTime.fromISO(fecha, { zone: zonaHoraria }).setLocale("es");
        // Formatea el día y la fecha
        const diaFormateado = fechaLuxon.toFormat(dia);
        const valor = diaFormateado.charAt(0).toUpperCase() +
            diaFormateado.slice(1) +
            ', ' + fechaLuxon.toFormat(formato);
        return valor;
    }

    // METODO PARA FORMATEAR LA HORA
    FormatearHora(hora: string, formato: string) {
        const horaLuxon = DateTime.fromFormat(hora, 'HH:mm:ss');
        const valor = horaLuxon.toFormat(formato);
        return valor;
    }

    // METODO PARA FORMATEAR LA HORA CONSIDERANDO LA ZONA HORARIA DEL DISPOSITIVO
    FormatearHoraZonaHoraria(fecha: string, formato: string, zonaHoraria: string) {
        // Convierte la fecha al formato ISO y aplica la zona horaria
        const fechaLuxon = DateTime.fromISO(fecha, { zone: zonaHoraria });
        const valor = fechaLuxon.toFormat(formato);
        return valor;
    }

    // METODO PARA FORMATEAR DIFERENTES FORMATOS DE FECHA
    DarFormatoFecha(fechaString: string, formatoSalida: string): string | null {
        const formatos = ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy/MM/dd'];
        let fecha: DateTime;

        fecha = DateTime.fromISO(fechaString);
        if (fecha.isValid) {
            return fecha.toFormat(formatoSalida);
        }

        for (const formato of formatos) {
            fecha = DateTime.fromFormat(fechaString, formato);
            if (fecha.isValid) {
                return fecha.toFormat(formatoSalida);
            }
        }
        return null;
    }

    // METODO PARA OBTENER DETALLE DE PLANIFICACION
    ver_detalle: boolean = false;
    ver_acciones: boolean = false;
    paginar: boolean = false;
    detalles: any = [];
    detalle_acciones: any = [];
    // ACCIONES DE HORARIOS
    entrada: '';
    salida: '';
    inicio_comida = '';
    fin_comida = '';
    // MODULOS
    ObtenerDetallesPlanificacion(datos) {
        this.entrada = '';
        this.salida = '';
        this.inicio_comida = '';
        this.fin_comida = '';
        this.detalles = [];
        let codigo_horario = '';
        let tipos: any = [];
        let accion = '';
        let tipo_dia = '';
        // VARIABLES AUXILIARES
        let aux_h = '';
        let aux_a = '';

        // BUSQUEDA DE DETALLES DE PLANIFICACIONES   
        if (datos.length > 0) {
            this.ver_acciones = true;
            this.detalle_acciones = [];

            datos.forEach(obj => {
                if (aux_h === '') {
                    accion = obj.tipo_hora + ': ' + obj.horario;
                    tipo_dia = obj.tipo_dia;
                    this.ValidarAcciones(obj);

                } else if (obj.id_horario === aux_h) {
                    if (obj.tipo_hora != aux_a) {
                        accion = accion + ' , ' + obj.tipo_hora + ': ' + obj.horario
                        codigo_horario = obj.id_horario;
                        tipo_dia = obj.tipo_dia;
                        this.ValidarAcciones(obj);
                    }
                } else {
                    // CONCATENAR VALORES ANTERIORES
                    tipos = [{
                        acciones: accion,
                        horario: codigo_horario,
                        entrada: this.entrada,
                        inicio_comida: this.inicio_comida,
                        fin_comida: this.fin_comida,
                        salida: this.salida,
                        tipo_dia: tipo_dia
                    }]

                    this.detalle_acciones = this.detalle_acciones.concat(tipos);
                    // LIMPIAR VALORES
                    accion = obj.tipo_hora + ': ' + obj.horario;
                    codigo_horario = obj.id_horario;
                    tipo_dia = '';
                    this.entrada = '';
                    this.salida = '';
                    this.inicio_comida = '';
                    this.fin_comida = '';
                    this.ValidarAcciones(obj);
                }

                // ASIGNAR VALORES A VARIABLES AUXILIARES
                aux_h = obj.id_horario;
                aux_a = obj.tipo_hora;
            })

            // AL FINALIZAR EL CICLO CONCATENAR VALORES
            tipos = [{
                acciones: accion,
                horario: codigo_horario,
                entrada: this.entrada,
                inicio_comida: this.inicio_comida,
                fin_comida: this.fin_comida,
                salida: this.salida,
                tipo_dia: tipo_dia
            }]

            this.detalle_acciones = this.detalle_acciones.concat(tipos);
            return this.detalle_acciones
        }
        else {
            this.showToast('Ups no se han encontrado registros!!!,  No existe detalle de planificación.', 4000, "warning");
            return this.detalle_acciones = undefined;
        }
    }

    // METODO PARA DEFINIR EL VALOR DE CASA DIA DEL PLAN HORARIO
    ObtenerPlanHorarioPorDia(res: any, dia_ingresa: any, identificador: boolean) {
        let laboral = 1;

        const diaComoString = String(dia_ingresa);

        switch (diaComoString) {
            case '1':
                if (res.dia1 != 'L' && res.dia1 != '-' && res.dia1 != 'FD' && res.dia1 != 'L, L' && res.dia1 != 'L, L, L') {

                    if (res.dia1 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
  
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '2':
                if (res.dia2 != 'L' && res.dia2 != '-' && res.dia2 != 'FD' && res.dia2 != 'L, L' && res.dia2 != 'L, L, L') {

                    if (res.dia2 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }

                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '3':
                if (res.dia3 != "L" && res.dia3 != "-" && res.dia3 != "FD" && res.dia3 != "L, L" && res.dia3 != "L, L, L") {

                    if (res.dia3 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }

                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '4':
                if (res.dia4 != "L" && res.dia4 != "-" && res.dia4 != 'FD' && res.dia4 != 'L, L' && res.dia4 != 'L, L, L') {
                    if (res.dia4 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
                   
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '5':
                if (res.dia5 != "L" && res.dia5 != "-" && res.dia5 != 'FD' && res.dia5 != 'L, L' && res.dia5 != 'L, L, L') {
                    if (res.dia5 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
                    
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '6':
                if (res.dia6 != "L" && res.dia6 != "-" && res.dia6 != 'FD' && res.dia6 != 'L, L' && res.dia6 != 'L, L, L') {
                    if (res.dia6 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
                   
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '7':
                if (res.dia7 != "L" && res.dia7 != "-" && res.dia7 != 'FD' && res.dia7 != 'L, L' && res.dia7 != 'L, L, L') {
                    if (res.dia7 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
            
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '8':
                if (res.dia8 != "L" && res.dia8 != "-" && res.dia8 != 'FD' && res.dia8 != 'L, L' && res.dia8 != 'L, L, L') {
                    if (res.dia8 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
               
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '9':
                if (res.dia9 != "L" && res.dia9 != "-" && res.dia9 != 'FD' && res.dia9 != 'L, L' && res.dia9 != 'L, L, L') {
                    if (res.dia9 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
              
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '10':
                if (res.dia10 != "L" && res.dia10 != "-" && res.dia10 != 'FD' && res.dia10 != 'L, L' && res.dia10 != 'L, L, L') {
                    if (res.dia10 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
               
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '11':
                if (res.dia11 != "L" && res.dia11 != "-" && res.dia11 != 'FD' && res.dia11 != 'L, L' && res.dia11 != 'L, L, L') {
                    if (res.dia11 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
      
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '12':
                if (res.dia12 != "L" && res.dia12 != "-" && res.dia12 != 'FD' && res.dia12 != 'L, L' && res.dia12 != 'L, L, L') {
                    if (res.dia12 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
        
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '13':
                if (res.dia13 != "L" && res.dia13 != "-" && res.dia13 != 'FD' && res.dia13 != 'L, L' && res.dia13 != 'L, L, L') {
                    if (res.dia13 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
     
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '14':
                if (res.dia14 != "L" && res.dia14 != "-" && res.dia14 != 'FD' && res.dia14 != 'L, L' && res.dia14 != 'L, L, L') {
                    if (res.dia14 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
     
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '15':
                if (res.dia15 != "L" && res.dia15 != "-" && res.dia15 != 'FD' && res.dia15 != 'L, L' && res.dia15 != 'L, L, L') {
                    if (res.dia15 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
      
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '16':
                if (res.dia16 != "L" && res.dia16 != "-" && res.dia16 != 'FD' && res.dia16 != 'L, L' && res.dia16 != 'L, L, L') {
                    if (res.dia15 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
      
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '17':
                if (res.dia17 != "L" && res.dia17 != "-" && res.dia17 != 'FD' && res.dia17 != 'L, L' && res.dia17 != 'L, L, L') {
                    if (res.dia17 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
       
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '18':
                if (res.dia18 != "L" && res.dia18 != "-" && res.dia18 != 'FD' && res.dia18 != 'L, L' && res.dia18 != 'L, L, L') {
                    if (res.dia18 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
     
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '19':
                if (res.dia19 != "L" && res.dia19 != "-" && res.dia19 != 'FD' && res.dia19 != 'L, L' && res.dia19 != 'L, L, L') {
                    if (res.dia19 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
   
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '20':
                if (res.dia20 != "L" && res.dia20 != "-" && res.dia20 != 'FD' && res.dia20 != 'L, L' && res.dia20 != 'L, L, L') {
                    if (res.dia20 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
        
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '21':
                if (res.dia21 != "L" && res.dia21 != "-" && res.dia21 != 'FD' && res.dia21 != 'L, L' && res.dia21 != 'L, L, L') {
                    if (res.dia21 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }

                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '22':
                if (res.dia22 != "L" && res.dia22 != "-" && res.dia22 != 'FD' && res.dia22 != 'L, L' && res.dia22 != 'L, L, L') {
                    if (res.dia22 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }

                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '23':
                if (res.dia23 != "L" && res.dia23 != "-" && res.dia23 != 'FD' && res.dia23 != 'L, L' && res.dia23 != 'L, L, L') {
                    if (res.dia23 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
         
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    } else {
                        return { dia_retur: 1, codigo: res[0].dia23 }
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '24':
                if (res.dia24 != "L" && res.dia24 != "-" && res.dia24 != 'FD' && res.dia24 != 'L, L' && res.dia24 != 'L, L, L') {
                    if (res.dia24 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
       
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '25':
                if (res.dia25 != "L" && res.dia25 != "-" && res.dia25 != 'FD' && res.dia25 != 'L, L' && res.dia25 != 'L, L, L') {
                    if (res.dia25 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
  
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '26':
                if (res.dia26 != "L" && res.dia26 != "-" && res.dia26 != 'FD' && res.dia26 != 'L, L' && res.dia26 != 'L, L, L') {
                    if (res.dia26 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }

                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '27':
                if (res.dia27 != "L" && res.dia27 != "-" && res.dia27 != 'FD' && res.dia27 != 'L, L' && res.dia27 != 'L, L, L') {
                    if (res.dia27 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
   
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '28':
                if (res.dia28 != "L" && res.dia28 != "-" && res.dia38 != 'FD' && res.dia28 != 'L, L' && res.dia28 != 'L, L, L') {
                    if (res.dia28 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
       
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '29':
                if (res.dia29 != "L" && res.dia29 != "-" && res.dia29 != 'FD' && res.dia29 != 'L, L' && res.dia29 != 'L, L, L') {
                    if (res.dia29 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
      
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '30':
                if (res.dia30 != "L" && res.dia30 != "-" && res.dia30 != 'FD' && res.dia30 != 'L, L' && res.dia30 != 'L, L, L') {
                    if (res.dia30 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }
    
                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            case '31':
                if (res.dia31 != "L" && res.dia31 != "-" && res.dia31 != 'FD' && res.dia31 != 'L, L' && res.dia31 != 'L, L, L') {
                    if (res.dia31 == 'DEFAULT-FERIADO') {
                        laboral = 2;
                        if (identificador == true) {
                            return laboral
                        }
                    }

                    laboral = 0;
                    if (identificador == true) {
                        return laboral
                    } else {
                        return { dia_retur: 1, codigo: res[0].dia31 };
                    }
                } else {
                    laboral = 1;
                    if (identificador == true) {
                        return laboral
                    }
                }
                break;
            default:
                if (identificador == true) {
                    return laboral = 1;
                } else {
                    return { dia_retur: undefined, codigo: undefined };
                }
        }

        if (identificador == false) {
            return { dia_retur: 0, codigo: '' };
        } else {
            //return laboral = 1;
        }
    }



















    /////////////////////////////////////////// METODOS DE VALIDACIONES PARA SOLICITUDES /////////////////////////////////////////////////////////
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
        const inicio = DateTime.fromJSDate(horaInicio).toFormat('yyyy-MM-dd\'T\'HH:mm');
        const final = DateTime.fromJSDate(horaFinal).toFormat('yyyy-MM-dd\'T\'HH:mm');

        if (inicio > final) {
            this.showToast('La hora de Inicio no puede ser MAYOR a la hora Final', 3000, "warning")
            return false
        }
        if (horasIguales === false) {
            if (inicio === final) {
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
        const fec = fecha.toString()
        return new Date(fec.split('T')[0] + 'T' + hora)
    }

    MilisegToSegundos(miliseg: number) {
        return miliseg / 1000
    }

    MinutosToSegundos(dato: number): number {
        return dato * 60;
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

        var h = parseInt(dato.split(':')[0]) * 3600;
        var m = parseInt(dato.split(':')[1]) * 60;
        var s = parseInt(dato.split(':')[2]);

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

    SegundosTransformDiaLaboral(inicio: string, final: string, tiempo_total: number, totalHorar: number, horario: HorarioE, horas_trabaja: number, feriado: Cg_Feriados[]): any {

        //Condicion para calcular horas de permiso tomando simepre un dia de permiso
        if (tiempo_total <= (horas_trabaja)) { // validacion para permisos de un mismo dia laboral 
    
            let tiempo_transcurrido_horas = this.SegundosToHHMM(tiempo_total);
  
            return {
                dia: 0,
                tiempo_transcurrido: tiempo_transcurrido_horas,
                dia_libre: 0,
            }
        }

        //Condicion para calcular los dias de permiso 
        if (tiempo_total % 86400 === 0) { // logica para comprovar si el tiempo ingresado solo son dias de 24 horas exactos tomando en cuenta que la hora final es igual a la de inicio.

            //logica de validacion de dias laborales y libres.
            const { dia_laborable, dia_libre } = this.vacacionesByFeriadoAndHorarioE(inicio, final, horario, feriado);
            return {
                dia: dia_laborable,
                tiempo_transcurrido: this.SegundosToHHMM(tiempo_total),// el tiempo es 00:00:00
                dia_libre: dia_libre
            }

        } else {// para unir calculo de dias y horas

            const { dia_laborable, dia_libre } = this.vacacionesByFeriadoAndHorarioE(inicio, final, horario, feriado);
            let tiempotranscurrido_horas = '00:00:00';

            tiempotranscurrido_horas = this.SegundosToHHMM(totalHorar);

            return {
                dia: dia_laborable - 1,
                tiempo_transcurrido: tiempotranscurrido_horas,
                dia_libre: dia_libre
            }
        }
    }

    lista_plan: any = [];
    filtro: any = [];
    // METODO PARA CALCULAR LOS DIAS DE VACACIONES 
    vacacionesByFeriadoAndHorarioE(inicio: string, final: string, horario: HorarioE, feriado: Cg_Feriados[]): any {
        this.lista_plan = horario;
        this.filtro = [];

        const fec_aux = new Date(inicio.split('T')[0])//variable auxiliar de la fecha de inicio, me toma un dia anterior.90p-[=]
        const fecha1 = DateTime.fromISO(inicio);
        const fecha2 = DateTime.fromISO(final);
        //let diaslibre: any = 0;
        const diasDiferencia = fecha2.diff(fecha1, 'days');//variable de los dias de diferencia que hay entre el dia final y el inicial

        let res: Array<any> = [];
        // se aplica logica matematica

        for (let i = 0; i <= diasDiferencia; i++) {
            const fec_string = fec_aux.toJSON().split('T')[0];
            const [fer] = feriado.filter(o => { return o.fecha === fec_string })
            const dia = DateTime.fromISO(fec_string).day; // Obtiene el día del mes
            const mes = DateTime.fromISO(fec_string).month;

            this.lista_plan.filter(item => {
                if (item.mes == mes) {
                    this.filtro = item;
                }
            })

            let horario_laboral = {
                fecha: fec_string,
                labora: this.ObtenerPlanHorarioPorDia(this.filtro, dia, true),
                feriado: (fer) ? 0 : 1 // 0 = hay feriado | 1 = no hay feriado
            }
            res.push(horario_laboral)
            fec_aux.setDate(fec_aux.getDate() + 1)
        }

        const labora = res.filter(o => {
            return 0 === (o.labora * o.feriado)
        })
        const libre = res.filter(o => {
            return 1 === (o.labora * o.feriado)
        })

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

    // CONDICIONES DE ACCIONES EN HORARIO ASIGNADO
    ValidarAcciones(obj: any) {
        if (obj.tipo_hora === 'E') {
            return this.entrada = obj.horario;
        }
        if (obj.tipo_hora === 'S') {
            return this.salida = obj.horario;
        }
        if (obj.tipo_hora === 'I/A') {
            return this.inicio_comida = obj.horario;
        }
        if (obj.tipo_hora === 'F/A') {
            return this.fin_comida = obj.horario;
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



    /** ********************************************************************************* **
     ** **                           OBTENER IPs DEL CLIENTE                           ** **
     ** ********************************************************************************* **/

    // METODO PARA OBTENER EL IP DEL CLIENTE
    ObtenerIPsLocales = () => {

        return new Promise((resolve) => {
            const ips: any = [];
            const peerConnection = new RTCPeerConnection();
            peerConnection.createDataChannel("");
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;
                    const ip = ipRegex.exec(event.candidate.candidate);
                    if (ip && !ips.includes(ip[0])) {
                        // AGREGAR IP UNICA
                        ips.push(ip[0]);
                    }
                } else {
                    peerConnection.close();
                    // FINALIZAR Y DEVOLVER IPS LOCALES
                    resolve(ips);
                }
            };
            peerConnection.createOffer().then((offer) => peerConnection.setLocalDescription(offer));
        });
    };


}
