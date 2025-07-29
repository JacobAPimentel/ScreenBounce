import { AfterContentInit, AfterViewInit, Component, ContentChild, ElementRef, input, TemplateRef, ViewChild } from "@angular/core";

@Component({
  selector: "app-input-field-label",
  imports: [],
  templateUrl: "./input-field-label.component.html",
  styleUrl: "./input-field-label.component.css"
})
export class InputFieldLabelComponent
{
  public id = crypto.randomUUID()
  public label = input<string>()
}