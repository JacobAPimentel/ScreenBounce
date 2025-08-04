import { Component, forwardRef, input } from "@angular/core";
import { ColorableLogoComponent } from "../colorable-logo/colorable-logo.component";

@Component({
  selector: "app-logo-svg",
  imports: [],
  templateUrl: "./logo-svg.component.html",
  styleUrl: "./logo-svg.component.css",
  providers: [ {provide: ColorableLogoComponent, useExisting: forwardRef(() => LogoSvgComponent) }]
})
export class LogoSvgComponent extends ColorableLogoComponent 
{
  public static readonly DEFAULT_SIZE: number = 500;

  defaultPath: string = "assets/DefaultLogo.svg";
  filePath = input("",{transform: (value) => value ?? this.defaultPath});
  width = input(500);
  height = input(300);
  colorOpacity = input(1);

  public static determineSpawnSize(width: number, height: number): [number, number]
  {
    const minSize: number = Math.min(LogoSvgComponent.DEFAULT_SIZE,Math.min(window.innerHeight,window.innerWidth)*0.60);

    const highest = Math.max(width,height);
    if(highest > minSize)
    {
      const scale = minSize/highest;
      width *= scale;
      height *= scale;
    }

    return [width,height];
  }
}
