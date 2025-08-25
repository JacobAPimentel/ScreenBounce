import { Component, ElementRef, ViewChild } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { InputFieldNumberComponent } from "../input-field-number/input-field-number.component";
import { InputFieldLabelComponent } from "../input-field-label/input-field-label.component";

@Component({
  selector: "app-input-field-color",
  imports: [ReactiveFormsModule, InputFieldLabelComponent],
  templateUrl: "./input-field-color.component.html",
  styleUrl: "./input-field-color.component.css"
})
export class InputFieldColorComponent extends InputFieldNumberComponent
{
  @ViewChild("inputColor") private inputColor!: ElementRef;
  @ViewChild("inputText") private inputText!: ElementRef;

  /**
   * If the color / number input changed, make sure the other value changes with it.
   * 
   * @param element - The element that was changed.
   */
  protected onChange(element: HTMLInputElement): void
  {
    const other: HTMLInputElement = (element === this.inputColor.nativeElement ? this.inputText : this.inputColor).nativeElement;
    other.value = element.value;
  }
}
