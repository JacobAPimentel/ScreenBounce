import { CommonModule } from "@angular/common";
import { Component, ViewChildren, ViewEncapsulation, AfterViewInit, QueryList } from "@angular/core";
import { DvdLogoComponent } from "./dvd-logo/dvd-logo.component";
import { LogoTextComponent } from "./logo-text/logo-text.component";
import { LogoSvgComponent } from "./logo-svg/logo-svg.component";

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
  imports: [CommonModule, DvdLogoComponent, LogoTextComponent, LogoSvgComponent],
  templateUrl: "./screen-bouncer.component.html",
  styleUrl: "./screen-bouncer.component.css",
  encapsulation: ViewEncapsulation.None
})
export class DvdScreensaverComponent implements AfterViewInit {
  minWinSize: number = Math.min(window.innerHeight,window.innerWidth)
  moveId: number = 0;
  logos: Logo[] = [
    {type: "svg", size: Math.min(500,this.minWinSize * 0.5)}
  ];
  @ViewChildren(DvdLogoComponent) logoComps!: QueryList<DvdLogoComponent>;
  
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
}
