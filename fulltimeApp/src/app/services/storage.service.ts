import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private isInitialized = false;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    this.isInitialized = true;
  }

  async set(key: string, value: any) {
    await this.ensureInitialized();
    this._storage?.set(key, value);
  }

  async get(key: string) {
    await this.ensureInitialized();
    return this._storage?.get(key);
  }

  private async ensureInitialized() {
    while (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  // ELIMINAR TODOS LOS ITEMS DEL STORAGE
  async clear() {
    try {
      await this._storage?.clear();
    } catch (error) {
      throw error;
    }
  }

  async remove(key: string) {
    await this.ensureInitialized();
    this._storage?.remove(key);
  }
}
