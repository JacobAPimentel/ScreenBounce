import { CommonModule } from "@angular/common";
import { Component, ViewChildren, AfterViewInit, QueryList, inject } from "@angular/core";
import { DvdLogoComponent } from "./dvd-logo/dvd-logo.component";
import { LogoTextComponent } from "./logo-text/logo-text.component";
import { LogoImageComponent } from "./logo-image/logo-image.component";
import { CollapsibleComponent } from "./collapsible/collapsible.component";
import { OptionsPaneComponent } from "./settings/options-pane/options-pane.component";
import { LogosCacheService } from "../../services/logos-cache.service";
import { BackgroundService } from "../../services/background.service";

@Component({
  selector: "app-screenbouncer",
  imports: [CommonModule, DvdLogoComponent, LogoTextComponent, LogoImageComponent, CollapsibleComponent, OptionsPaneComponent],
  templateUrl: "./screen-bouncer.component.html",
  styleUrl: "./screen-bouncer.component.css",
})
export class DvdScreensaverComponent implements AfterViewInit 
{
  //Properties
  private moveId = 0;

  //Dependencies
  protected background = inject(BackgroundService);
  protected cache = inject(LogosCacheService);


  @ViewChildren(DvdLogoComponent) private logoComps!: QueryList<DvdLogoComponent>;

  /**
   * Start moving all of the logos after init.
   */
  public ngAfterViewInit(): void
  {
    this.moveAllLogos();
  }

  /**
   * A cursive function that will constantly move all logos.
   */
  private moveAllLogos(): void
  {
    const startTime: DOMHighResTimeStamp = window.performance.now();

    this.moveId = requestAnimationFrame((timestamp: DOMHighResTimeStamp) => 
    {
      const dt: DOMHighResTimeStamp = (timestamp - startTime)/1000;

      for(const logo of this.logoComps)
      {
        logo.moveFrame(dt);
      }
      
      this.moveAllLogos();
    });
  }
}