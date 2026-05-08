import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export type ReportFormat = 'pdf';
export type ReportModule = 'solicitud-vacacion';

@Injectable({
  providedIn: 'root'
})
export class ReportesMicroService {

  private readonly base = environment.reportesURL;

  constructor(
    private http: HttpClient
  ) { }

  generarReporteServicio(
    modulo: ReportModule,
    formato: ReportFormat,
    payload: any
  ): Observable<{ blob: Blob; filename: string }> {

    const url = `${this.base}/${modulo}/${formato}`;

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map((resp: HttpResponse<Blob>) => {
        const contentDisposition = resp.headers.get('Content-Disposition') || '';
        const filename = this.extraerNombreDeContentDisposition(contentDisposition)
          || `reporte_${modulo}.${formato}`;

        return {
          blob: resp.body as Blob,
          filename
        };
      })
    );
  }

  private extraerNombreDeContentDisposition(cd: string): string | null {
    const star = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cd);

    if (star?.[1]) {
      try {
        return decodeURIComponent(star[1]);
      } catch {
        return null;
      }
    }

    const normal = /filename\s*=\s*("?)([^";]+)\1/i.exec(cd);
    return normal ? normal[2] : null;
  }
}