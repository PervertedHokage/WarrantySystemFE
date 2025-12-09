import { InjectionToken } from '@angular/core';

export const BASE_URL = new InjectionToken<string>('BASE_URL');
export interface RuntimeConfig {
  apiBaseUrl: string;
}

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  try {
    const res = await fetch('/assets/environments/config.dev.json', {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
    return (await res.json()) as RuntimeConfig;
  } catch (err) {
    console.error('Could not load runtime config, using fallback', err);
    return { apiBaseUrl: '' };
  }
}
