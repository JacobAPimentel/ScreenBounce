import { Component, forwardRef, input, InputSignal } from "@angular/core";
import { ColorableLogoComponent } from "../colorable-logo/colorable-logo.component";

@Component({
  selector: "app-logo-text",
  imports: [],
  templateUrl: "./logo-text.component.html",
  styleUrl: "./logo-text.component.css",
  providers: [ {provide: ColorableLogoComponent, useExisting: forwardRef(() => LogoTextComponent) }],
  host: {
    "[style.font-size.px]": "fontSize()",
    "[style.color]": "color",
  }
})
export class LogoTextComponent extends ColorableLogoComponent 
{
  public text: InputSignal<string> = input("DVD");
  public fontSize: InputSignal<number> = input(10);
}
 