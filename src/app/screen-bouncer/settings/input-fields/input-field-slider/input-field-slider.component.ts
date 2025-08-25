import { Component, ElementRef, ViewChild } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { InputNumberOnlyDirective } from "../../../../directives/input-number-only.directive";
import { InputFieldNumberComponent } from "../input-field-number/input-field-number.component";
import { InputFieldLabelComponent } from "../input-field-label/input-field-label.component";

@Component({
  selector: "app-input-field-slider",
  imports: [ReactiveFormsModule, InputNumberOnlyDirective, InputFieldLabelComponent],
  templateUrl: "./input-field-slider.component.html",
  styleUrl: "./input-field-slider.component.css"
})
export class InputFieldSliderComponent extends InputFieldNumberComponent
{
  @ViewChild("inputRange") private inputRange!: ElementRef;
  @ViewChild("inputNumber") private inputNumber!: ElementRef;

  /**
   * If the range / number input changed, make sure the other value changes with it.
   * 
   * @param element - The element that was changed.
   */
  protected onChange(element: HTMLInputElement): void
  {
    const other: HTMLInputElement = (element === this.inputRange.nativeElement ? this.inputNumber : this.inputRange).nativeElement;
    other.value = element.value;
  }
}
