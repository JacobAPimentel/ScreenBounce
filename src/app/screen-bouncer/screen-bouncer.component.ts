import { CommonModule } from "@angular/common";
import { Component, ViewChildren, AfterViewInit, QueryList, ViewChild, ElementRef } from "@angular/core";
import { DvdLogoComponent } from "./dvd-logo/dvd-logo.component";
import { LogoTextComponent } from "./logo-text/logo-text.component";
import { LogoSvgComponent } from "./logo-svg/logo-svg.component";
import { CollapsibleComponent } from "./collapsible/collapsible.component";
import { OptionsPaneComponent } from "./options-pane/options-pane.component";

export type Logo = LogoText | LogoSvg

export interface BaseLogo {
  size: number;
}

export interface LogoText extends BaseLogo {
  type: "text";
  text: string;
}

export interface LogoSvg extends BaseLogo {
  type: "svg"
  filePath?: string;
}

@Component({
  selector: "app-screenbouncer",
  imports: [CommonModule, DvdLogoComponent, LogoTextComponent, LogoSvgComponent, CollapsibleComponent, OptionsPaneComponent],
  templateUrl: "./screen-bouncer.component.html",
  styleUrl: "./screen-bouncer.component.css",
})
export class DvdScreensaverComponent implements AfterViewInit {
  isExpanded = false;
  minWinSize: number = Math.min(window.innerHeight,window.innerWidth)
  moveId: number = 0;
  logos: Logo[] = [
    {type: "svg", size: Math.min(500,this.minWinSize * 0.5)}
  ];
  @ViewChildren(DvdLogoComponent) logoComps!: QueryList<DvdLogoComponent>;

  //TODO: make a new component that handles all dvd, and use :host() component to determine the size rather than "viewport"
  @ViewChild("viewport",{static: false}) viewportFrame!: ElementRef;

  ngAfterViewInit(){
    this.logoComps.forEach((logo: DvdLogoComponent) => {logo.randomDirection()})
    this.moveAllLogos();
  }

  moveAllLogos() 
  {
    const startTime: DOMHighResTimeStamp = window.performance.now();

    this.moveId = requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
      const dt: DOMHighResTimeStamp = (timestamp - startTime)/1000;

      this.logoComps.forEach((logo: DvdLogoComponent) => {
        logo.moveFrame(dt);
      })
      this.moveAllLogos();
    })
  }

  settingsClicked(isExpanded: boolean)
  {
    this.isExpanded = isExpanded;
  }
}