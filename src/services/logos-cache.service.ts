import { inject, Injectable } from "@angular/core";
import { Logo } from "../models/logo";
import { DatabaseService } from "./database.service";

@Injectable({
  providedIn: "root"
})
export class LogosCacheService 
{
  //Properties
  public logos!: Logo[];

  //Dependencies
  private db = inject(DatabaseService);
  
  public constructor()
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

    //Logo was added
    this.db.logosAdded$.subscribe((logo) => 
    {
      this.logos.push(logo);
    });

    //Logo was deleted
    this.db.logosDeleted$.subscribe((id) => 
    {
      this.logos.splice(this.logos.findIndex(logo => logo.id === id),1);
    });
  }
}