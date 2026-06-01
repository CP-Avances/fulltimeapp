import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  private readonly TOKEN_KEY = 'token';

  // GUARDAR TOKEN
  async setToken(token: string): Promise<void> {
    await Preferences.set({
      key: this.TOKEN_KEY,
      value: token
    });
  }

  // OBTENER TOKEN
  async getToken(): Promise<string | null> {
    const result = await Preferences.get({
      key: this.TOKEN_KEY
    });

    return result.value;
  }

  // ELIMINAR TOKEN
  async removeToken(): Promise<void> {
    await Preferences.remove({
      key: this.TOKEN_KEY
    });
  }

}