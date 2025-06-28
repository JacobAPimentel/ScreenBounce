import { Component, forwardRef, input } from "@angular/core";
import { ColorableLogoComponent } from "../colorable-logo/colorable-logo.component";

@Component({
  selector: "app-logo-svg",
  imports: [],
  templateUrl: "./logo-svg.component.html",
  styleUrl: "./logo-svg.component.css",
  providers: [ {provide: ColorableLogoComponent, useExisting: forwardRef(() => LogoSvgComponent) }]
})
export class LogoSvgComponent extends ColorableLogoComponent {
  defaultPath: string = "assets/DefaultLogo.svg";
  filePath  = input("",{transform: (value) => value ?? this.defaultPath});
}
