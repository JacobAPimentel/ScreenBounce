import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { DatabaseService } from "../services/database.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), 
    provideRouter(routes),
    provideAppInitializer((): Promise<boolean> =>
    {
      const db = inject(DatabaseService);
      return db.loadSuccess;
    }),
  ]
};
