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
  //Constants
  public static readonly DEFAULT_SIZE: number = 500;

  private defaultPath = "assets/DefaultLogo.svg";
  public filePath = input("",{transform: (value) => value ?? this.defaultPath});
  public width = input(500);
  public height = input(300);
  public colorOpacity = input(1);

  /**
   * Determine the size of the image in respect to the image aspect ratio and
   * the current size of the window.
   * 
   * @param width - The width of the image.
   * @param height - The height of the image.
   * @returns 
   * [width, height], in respect to the current window resolution.
   */
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
