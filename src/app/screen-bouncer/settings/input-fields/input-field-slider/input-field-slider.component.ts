import { AfterViewInit, Component, ElementRef, input, ViewChild } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { InputNumberOnlyDirective } from "../../../../directives/input-number-only.directive";
import { InputFieldLabelComponent } from "../../input-field-label/input-field-label.component";
import { InputFieldNumberComponent } from "../input-field-number/input-field-number.component";

@Component({
  selector: "app-input-field-slider",
  imports: [ReactiveFormsModule, InputNumberOnlyDirective, InputFieldLabelComponent],
  templateUrl: "./input-field-slider.component.html",
  styleUrl: "./input-field-slider.component.css"
})
export class InputFieldSliderComponent extends InputFieldNumberComponent
{
  @ViewChild("inputRange") inputRange!: ElementRef;
  @ViewChild("inputNumber") inputNumber!: ElementRef;

  onChange(element: HTMLInputElement)
  {
    const other: HTMLInputElement = (element === this.inputRange.nativeElement ? this.inputNumber : this.inputRange).nativeElement
    other.value = element.value
  }
}
