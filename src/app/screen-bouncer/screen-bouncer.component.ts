import { CommonModule } from "@angular/common";
import { Component, ViewChildren, AfterViewInit, QueryList, inject } from "@angular/core";
import { DvdLogoComponent } from "./dvd-logo/dvd-logo.component";
import { LogoTextComponent } from "./logo-text/logo-text.component";
import { LogoSvgComponent } from "./logo-svg/logo-svg.component";
import { CollapsibleComponent } from "./collapsible/collapsible.component";
import { OptionsPaneComponent } from "./settings/options-pane/options-pane.component";
import { DatabaseService } from "../../services/database.service";
import { Logo, LogoBase, LogoImage } from "../../models/logo";
import { LogosCacheService } from "../../services/logos-cache.service";

@Component({
  selector: "app-screenbouncer",
  imports: [CommonModule, DvdLogoComponent, LogoTextComponent, LogoSvgComponent, CollapsibleComponent, OptionsPaneComponent],
  templateUrl: "./screen-bouncer.component.html",
  styleUrl: "./screen-bouncer.component.css",
})
export class DvdScreensaverComponent implements AfterViewInit {
  cache = inject(LogosCacheService);
  isExpanded = false;
  minWinSize: number = Math.min(window.innerHeight,window.innerWidth)
  moveId: number = 0;

  @ViewChildren(DvdLogoComponent) logoComps!: QueryList<DvdLogoComponent>;

  ngAfterViewInit()
  {
    this.moveAllLogos();
  }

  moveAllLogos() 
  {
    const startTime: DOMHighResTimeStamp = window.performance.now();

    this.moveId = requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
      const dt: DOMHighResTimeStamp = (timestamp - startTime)/1000;

      for(const logo of this.logoComps)
      {
        logo.moveFrame(dt);
      }
      
      this.moveAllLogos();
    })
  }

  settingsClicked(isExpanded: boolean)
  {
    this.isExpanded = isExpanded;
  }
}