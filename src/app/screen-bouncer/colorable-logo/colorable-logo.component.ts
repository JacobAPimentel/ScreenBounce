import { Component, input } from "@angular/core";

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
  imports: [],
  templateUrl: "./colorable-logo.component.html",
  styleUrl: "./colorable-logo.component.css"
})
export abstract class ColorableLogoComponent {
  size = input<number>(200);
  protected color: string = "white";

  setRandomColor(): void{
    const filteredColors: string[] = colors.filter((color) => {return color !== this.color});
    this.color = filteredColors[Math.floor(Math.random() * filteredColors.length)]
  }
}