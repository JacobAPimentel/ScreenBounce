import { ChangeDetectionStrategy, Component, model } from "@angular/core";

const colors = [
  "lightblue",
  "lightgreen",
  "lightcoral",
  "lightyellow",
  "lightpink",
  "lightskyblue",
  "lightseagreen",
  "lightsteelblue",
  "lightgoldenrodyellow",
  "lightcyan",
  "lightgray",
  "lavender",
  "mediumslateblue",
  "skyblue",
  "mediumaquamarine",
  "aquamarine",
  "seashell"
];

@Component({
  selector: "app-colorable-logo",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: "./colorable-logo.component.html",
  styleUrl: "./colorable-logo.component.css"
})
export abstract class ColorableLogoComponent 
{
  protected color = model("seashell");

  /**
   * Change the logo color to a new random color. Cannot be the same color as previous.
   */
  public setRandomColor(): void
  {
    const filteredColors: string[] = colors.filter((color) => {return color !== this.color();});
    this.color.set(filteredColors[Math.floor(Math.random() * filteredColors.length)]);
  }
}