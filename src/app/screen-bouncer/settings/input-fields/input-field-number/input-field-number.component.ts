import { Component, input } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { InputFieldLabelComponent } from "../../input-field-label/input-field-label.component";

@Component({
  selector: "app-input-field-number",
  imports: [ReactiveFormsModule,InputFieldLabelComponent],
  templateUrl: "./input-field-number.component.html",
  styleUrl: "./input-field-number.component.css"
})
export class InputFieldNumberComponent {
  public control = input.required<FormControl>();
  public label = input<string>();

  public step = input<number>(1);
  public min = input<number>(0);
  public max = input<number>(10000);
}
