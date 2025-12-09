/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ApplicationConfig } from '@angular/core';
import { BASE_URL, loadRuntimeConfig } from './app/runtime';

(async () => {
  const runtime = await loadRuntimeConfig();
  const config: ApplicationConfig = {
    providers: [
      ...appConfig.providers,
      { provide: BASE_URL, useValue: runtime.apiBaseUrl },
    ],
  };
  await bootstrapApplication(AppComponent, config).catch((err) =>
    console.error(err)
  );
})();
