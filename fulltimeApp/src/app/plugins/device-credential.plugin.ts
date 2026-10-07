import { registerPlugin } from '@capacitor/core';

export interface DeviceCredentialResult {
  authenticated: boolean;
  available: boolean;
  type: string;
}

export interface DeviceCredentialPlugin {
  authenticate(): Promise<DeviceCredentialResult>;
}

export const DeviceCredential =
  registerPlugin<DeviceCredentialPlugin>(
    'DeviceCredential'
  );
