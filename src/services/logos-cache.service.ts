import { inject, Injectable, signal } from "@angular/core";
import { Logo } from "../models/logo";
import { DatabaseService } from "./database.service";

@Injectable({
  providedIn: "root"
})
export class LogosCacheService 
{
  //Properties
  public logos = signal<Logo[]>([]);

  //Dependencies
  private db = inject(DatabaseService);
  
  public constructor()
  { 
    this.db.logos$.subscribe({
      next: logos => 
      {
        this.logos.set(logos);
      },
      error: err => 
      {
        const defaultLogo = this.db.defaultObject();
        defaultLogo.id = 1;
        this.logos.set([defaultLogo]);
        console.error(err);
      }
    });

    //Logo was added
    this.db.logosAdded$.subscribe((logo) => 
    {
      this.logos.update(logos => [...logos, logo]);
    });

    //Logo was deleted
    this.db.logosDeleted$.subscribe((id) => 
    {
      this.logos.update(logos => logos.filter(logo => logo.id !== id));
    });
  }

  /**
   * Replace a logo with a new one.
   * 
   * @param updated - The updated Logo. Should have the id.
   * 
   * @remarks
   * Uses map to properly signal that a change occurred.
   */
  public updateLogo(updated: Logo): void 
  {
    this.logos.update(logos =>
      logos.map(logo =>
        logo.id === updated.id ? updated : logo
      )
    );
  }
}