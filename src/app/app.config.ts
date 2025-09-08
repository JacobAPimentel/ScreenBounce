import { ApplicationConfig, inject, provideAppInitializer, provideExperimentalZonelessChangeDetection, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { DatabaseService } from "../services/database.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(), 
    provideRouter(routes),
    provideAppInitializer((): Promise<boolean> =>
    {
      const db = inject(DatabaseService);
      return db.loadSuccess;
    }),
  ]
};
