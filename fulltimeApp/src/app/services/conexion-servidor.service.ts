import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {

  private apiUrl = environment.urlMultitenant;

  constructor(private http: HttpClient) { }

  async checkServerConnection(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/pruebas/health`, { observe: 'response' })
          .pipe(timeout(1000))
      );

      return response.status === 200;
    } catch {
      return false;
    }
  }
}