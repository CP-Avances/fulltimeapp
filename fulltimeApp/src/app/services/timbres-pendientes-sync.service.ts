import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { DataLocalService } from '../libs/data-local.service';
import { RelojServiceService } from './reloj-service.service';
import { ParametrosService } from './parametros.service';
import { EmpleadosService } from './empleados.service';
import { ParametrosSistema } from '../libs/parametros.emun';
import { Timbre } from '../interfaces/Timbre';

export type ResultadoSincronizacionTimbres = {
    total: number;
    enviados: number;
    fallidos: number;
    mensaje: string;
    huboPendientes: boolean;
};

type ResultadoEnvioTimbre = {
    enviado: boolean;
    timbre: any;
    mensaje?: string;
};

@Injectable({
    providedIn: 'root'
})
export class TimbresPendientesSyncService {

    private readonly APP_MOVIL = 'APP_MOVIL';

    /*
      2 = Inicio alimentación
      3 = Fin alimentación
      4 = Inicio permiso
      5 = Fin permiso
      7 = Timbre especial / abierto
  
      Estos timbres pueden sincronizarse como DESCONOCIDO o SIN UBICACION
      aunque el parámetro general de ubicación desconocida esté desactivado.
    */
    private readonly TIMBRES_UBICACION_FLEXIBLE = new Set<string>(['2', '3', '4', '5', '7']);

    constructor(
        private dataLocalService: DataLocalService,
        private relojService: RelojServiceService,
        private restP: ParametrosService,
        private restE: EmpleadosService,
    ) { }

    // ============================================================
    // MÉTODO PRINCIPAL
    // ============================================================

    async sincronizarPendientes(idEmpleado: number): Promise<ResultadoSincronizacionTimbres> {
        const timbres = this.obtenerTimbresPendientes();

        if (timbres.length === 0) {
            return {
                total: 0,
                enviados: 0,
                fallidos: 0,
                huboPendientes: false,
                mensaje: 'No existen timbres pendientes por enviar.'
            };
        }

        try {
            await firstValueFrom(
                this.relojService.obtenerUsuario(idEmpleado).pipe(timeout(3000))
            );
        } catch {
            return {
                total: timbres.length,
                enviados: 0,
                fallidos: timbres.length,
                huboPendientes: true,
                mensaje: 'Falló la conexión con el servidor, no se pudieron enviar los timbres.'
            };
        }

        const rango = await this.obtenerRangoUbicacion();
        await this.actualizarParametroUbicacionDesconocida(idEmpleado);

        const resultados: ResultadoEnvioTimbre[] = [];

        /*
          Se envían secuencialmente para evitar cruces entre validaciones
          de ubicación, servicios y actualizaciones de storage.
        */
        for (const timbre of timbres) {
            const resultado = await this.procesarYEnviarTimbre(timbre, idEmpleado, rango);
            resultados.push(resultado);
        }

        const enviados = resultados.filter(r => r.enviado).length;
        const fallidos = resultados.length - enviados;

        if (enviados === resultados.length) {
            this.limpiarTimbresPendientes();

            return {
                total: resultados.length,
                enviados,
                fallidos,
                huboPendientes: true,
                mensaje: enviados > 1
                    ? `Los ${enviados} timbres se han enviado correctamente.`
                    : 'El timbre ha sido enviado exitosamente.'
            };
        }

        /*
          Como DataLocalService no tiene un método claro para eliminar solo
          los enviados, no se borra todo si hubo fallos. Así evitamos pérdida
          de registros. Luego podemos mejorar DataLocalService para dejar solo
          los fallidos.
        */
        return {
            total: resultados.length,
            enviados,
            fallidos,
            huboPendientes: true,
            mensaje: `Se enviaron ${enviados} de ${resultados.length} timbres. ${fallidos} timbre(s) permanecen pendientes.`
        };
    }

    // ============================================================
    // STORAGE
    // ============================================================

    obtenerTimbresPendientes(): Timbre[] {
        return [
            ...(this.dataLocalService.timbresPerdidosStorage ?? []),
            ...(this.dataLocalService.timbresStorage ?? [])
        ];
    }

    tieneTimbresPendientes(): boolean {
        return this.obtenerTimbresPendientes().length > 0;
    }

    private limpiarTimbresPendientes(): void {
        this.dataLocalService.eliminarInfo('timbresPerdidos');
        this.dataLocalService.eliminarInfo('timbres');
    }

    // ============================================================
    // PARÁMETROS
    // ============================================================

    private async obtenerRangoUbicacion(): Promise<number> {
        try {
            const res: any[] = await firstValueFrom(
                this.restP.ObtenerDetallesParametros(ParametrosSistema.TOLERANCIA_UBICACION)
                    .pipe(timeout(3000))
            );

            const parametro = res?.[0];
            return Number(parametro?.descripcion ?? 0);
        } catch {
            return 0;
        }
    }

    private async actualizarParametroUbicacionDesconocida(idEmpleado: number): Promise<void> {
        const buscar = {
            ids_empleados: [idEmpleado],
        };

        try {
            const res: any = await firstValueFrom(
                this.restP.ObtenerDetalleParametroUsuario(buscar).pipe(timeout(3000))
            );

            const parametro = res.data?.[0] ?? res.respuesta?.[0];

            if (!parametro) {
                localStorage.setItem('timbrarUbicacionDesconocida', 'No');
                return;
            }

            const resultado = parametro.timbre_ubicacion_desconocida ? 'Si' : 'No';
            localStorage.setItem('timbrarUbicacionDesconocida', resultado);

        } catch {
            localStorage.setItem('timbrarUbicacionDesconocida', 'No');
        }
    }

    // ============================================================
    // PROCESAR TIMBRE
    // ============================================================

    private async procesarYEnviarTimbre(
        timbre: any,
        idEmpleado: number,
        rango: number
    ): Promise<ResultadoEnvioTimbre> {

        const latitud = this.obtenerValorCoordenada(timbre.latitud);
        const longitud = this.obtenerValorCoordenada(timbre.longitud);

        try {
            const ubicacion = await this.calcularUbicacionTimbre(
                latitud,
                longitud,
                rango,
                timbre,
                idEmpleado
            );

            if (!ubicacion) {
                return {
                    enviado: false,
                    timbre,
                    mensaje: 'No se pudo validar la ubicación.'
                };
            }

            timbre.ubicacion = ubicacion;

            return await this.enviarTimbrePendiente(latitud, longitud, timbre);

        } catch {
            const timbrePendiente = {
                ...timbre,
                sincronizado: false,
                desde_memoria: false,
                desdeMemoria: false,
                fecha_subida_servidor: null,
                novedades_conexion: 'Falló nuevamente la conexión al servidor. Timbre pendiente de sincronización.'
            };

            this.dataLocalService.guardarTimbresPerdidos(timbrePendiente);

            return {
                enviado: false,
                timbre: timbrePendiente,
                mensaje: 'Error al procesar el timbre.'
            };
        }
    }

    // ============================================================
    // UBICACIÓN
    // ============================================================

    private obtenerValorCoordenada(valor: any): string {
        if (valor === null || valor === undefined || valor === '') {
            return '0';
        }

        return String(valor);
    }

    private obtenerTeclaFuncion(timbre: any): string {
        return String(
            timbre?.tecl_funcion ??
            timbre?.tecla_funcion ??
            timbre?.teclaFuncion ??
            ''
        );
    }

    private esTimbreFlexibleUbicacion(timbre: any): boolean {
        const teclaFuncion = this.obtenerTeclaFuncion(timbre);
        return this.TIMBRES_UBICACION_FLEXIBLE.has(teclaFuncion);
    }

    private permiteUbicacionDesconocida(timbre: any): boolean {
        return localStorage.getItem('timbrarUbicacionDesconocida') === 'Si' ||
            this.esTimbreFlexibleUbicacion(timbre);
    }

    private tieneCoordenadas(latitud: any, longitud: any): boolean {
        return !!latitud &&
            !!longitud &&
            String(latitud) !== '0' &&
            String(longitud) !== '0' &&
            String(latitud).toLowerCase() !== 'null' &&
            String(longitud).toLowerCase() !== 'null';
    }

    private async calcularUbicacionTimbre(
        latitud: any,
        longitud: any,
        rango: number,
        timbre: any,
        idEmpleado: number
    ): Promise<string> {

        if (!this.tieneCoordenadas(latitud, longitud)) {
            if (this.esTimbreFlexibleUbicacion(timbre)) {
                return 'SIN UBICACION';
            }

            if (this.permiteUbicacionDesconocida(timbre)) {
                return 'DESCONOCIDO';
            }

            return '';
        }

        const informacion = {
            lat1: String(latitud),
            lng1: String(longitud),
            lat2: '',
            lng2: '',
            valor: rango
        };

        const ubicacionPermitida = await this.buscarUbicacionPermitida(informacion, idEmpleado);

        if (ubicacionPermitida) {
            return ubicacionPermitida;
        }

        const domicilio = await this.validarDomicilio(informacion, idEmpleado);

        if (domicilio) {
            return domicilio;
        }

        if (this.permiteUbicacionDesconocida(timbre)) {
            return 'DESCONOCIDO';
        }

        return '';
    }

    private async buscarUbicacionPermitida(informacion: any, idEmpleado: number): Promise<string> {
        try {
            const res: any = await firstValueFrom(
                this.restP.ObtenerUbicacionUsuario(idEmpleado).pipe(timeout(3000))
            );

            const datosUbicacion: any[] = res.data ?? res ?? [];

            if (!Array.isArray(datosUbicacion) || datosUbicacion.length === 0) {
                return '';
            }

            for (const obj of datosUbicacion) {
                const data = {
                    ...informacion,
                    lat2: obj.latitud,
                    lng2: obj.longitud
                };

                const estaDentro = await this.validarCoordenadas(data);

                if (estaDentro) {
                    return obj.descripcion ?? 'Ubicación Permitida';
                }
            }

            return '';

        } catch {
            return '';
        }
    }

    private async validarDomicilio(informacion: any, idEmpleado: number): Promise<string> {
        try {
            const res: any = await firstValueFrom(
                this.restE.ObtenerUbicacion(idEmpleado).pipe(timeout(3000))
            );

            const domicilio = res.data?.[0] ?? res?.[0];

            if (!domicilio?.latitud || !domicilio?.longitud) {
                return '';
            }

            const data = {
                ...informacion,
                lat2: domicilio.latitud,
                lng2: domicilio.longitud
            };

            const estaDentro = await this.validarCoordenadas(data);

            return estaDentro ? 'DOMICILIO' : '';

        } catch {
            return '';
        }
    }

    private async validarCoordenadas(informacion: any): Promise<boolean> {
        try {
            const res: any = await firstValueFrom(
                this.restP.ObtenerCoordenadas(informacion).pipe(timeout(3000))
            );

            const resultado = res.data?.[0] ?? res?.[0];

            return resultado?.verificar === 'ok';

        } catch {
            return false;
        }
    }

    // ============================================================
    // ENVÍO
    // ============================================================

    private prepararTimbreSincronizado(
        latitud: any,
        longitud: any,
        timbre: any
    ): any {

        const novedadPrevia = timbre.novedades_conexion;

        /*
          Esta es la fecha original del timbre generado en el teléfono.
          No debe reemplazarse por la fecha actual del servidor.
        */
        const fechaOriginalTimbre =
            timbre.fec_hora_timbre ??
            timbre.fecha_hora_timbre ??
            timbre.fecha_hora_timbre_servidor ??
            null;

        return {
            ...timbre,

            /*
              Mantener la fecha original del timbre.
              El backend debe usar esta misma fecha para:
              - fecha_hora_timbre
              - fecha_hora_timbre_servidor
              - fecha_hora_timbre_validado
            */
            fec_hora_timbre: fechaOriginalTimbre,

            latitud: latitud !== null && latitud !== undefined ? String(latitud) : '0',
            longitud: longitud !== null && longitud !== undefined ? String(longitud) : '0',

            dispositivo_timbre: this.APP_MOVIL,

            /*
              Estas banderas indican al backend que este timbre estaba en memoria
              del teléfono y recién ahora se está sincronizando.
            */
            sincronizado: true,
            desde_memoria: true,
            desdeMemoria: true,

            /*
              La app envía NULL.
              El backend debe llenar fecha_subida_servidor con la fecha actual
              del servidor cuando reciba este timbre pendiente.
            */
            fecha_subida_servidor: null,

            /*
              Este timbre originalmente no llegó al servidor cuando fue generado.
            */
            conexion: false,

            /*
              IMPORTANTE:
              En timbres sincronizados desde memoria no se debe validar diferencia
              entre hora del teléfono y hora del servidor.
            */
            hora_timbre_diferente: false,

            novedades_conexion: novedadPrevia
                ? `${novedadPrevia} / Sincronizado posteriormente desde memoria del teléfono.`
                : 'Timbre sincronizado posteriormente desde memoria del teléfono.'
        };
    }

    private async enviarTimbrePendiente(
        latitud: any,
        longitud: any,
        timbre: any
    ): Promise<ResultadoEnvioTimbre> {

        const timbreEnviar = this.prepararTimbreSincronizado(latitud, longitud, timbre);

        try {
            await firstValueFrom(
                this.relojService.enviarTimbre(timbreEnviar).pipe(timeout(5000))
            );

            return {
                enviado: true,
                timbre: timbreEnviar
            };

        } catch {
            const timbrePendiente = {
                ...timbreEnviar,
                sincronizado: false,
                desde_memoria: false,
                desdeMemoria: false,
                fecha_subida_servidor: null,
                novedades_conexion: 'Falló nuevamente la conexión al servidor. Timbre pendiente de sincronización.'
            };

            this.dataLocalService.guardarTimbresPerdidos(timbrePendiente);

            return {
                enviado: false,
                timbre: timbrePendiente,
                mensaje: 'Falló nuevamente la conexión al servidor.'
            };
        }
    }
}