import { Component, forwardRef, input } from "@angular/core";
import { ColorableLogoComponent } from "../colorable-logo/colorable-logo.component";

@Component({
  selector: "app-logo-image",
  imports: [],
  templateUrl: "./logo-image.component.html",
  styleUrl: "./logo-image.component.css",
  providers: [ {provide: ColorableLogoComponent, useExisting: forwardRef(() => LogoImageComponent) }]
})
export class LogoImageComponent extends ColorableLogoComponent 
{
  public static readonly DEFAULT_SIZE: number = 500;

  defaultPath = "assets/DefaultLogo.svg";
  filePath = input("",{transform: (value) => value ?? this.defaultPath});
  width = input(500);
  height = input(300);
  colorOpacity = input(1);

  public static determineSpawnSize(width: number, height: number): [number, number]
  {
    const minSize = Math.min(LogoImageComponent.DEFAULT_SIZE,Math.min(window.innerHeight,window.innerWidth)*0.60);

    const highest = Math.max(width,height);
    if(highest > minSize)
    {
      const scale = minSize/highest;
      width *= scale;
      height *= scale;
    }

    return [Number(width.toFixed(2)),Number(height.toFixed(2))];
  }
}
