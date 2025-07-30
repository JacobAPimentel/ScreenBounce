import { inject, Injectable } from "@angular/core";
import { Logo } from "../models/logo";
import { DatabaseService } from "./database.service";

@Injectable({
  providedIn: "root"
})
export class LogosCacheService 
{
  private db = inject(DatabaseService);
  public logos!: Logo[];
  
  constructor() 
  { 
    this.db.logos$.subscribe({
      next: logos => 
      {
        this.logos = logos;
      },
      error: err => 
      {
        const defaultLogo = this.db.defaultObject();
        defaultLogo.id = 1;
        this.logos = [defaultLogo];
        console.error(err);
      }
    });

    this.db.logosAdded$.subscribe((logo) => 
    {
      this.logos.push(logo);
    });

    this.db.logosDeleted$.subscribe((id) => 
    {
      this.logos.splice(this.logos.findIndex(logo => logo.id === id),1);
    });
  }
}