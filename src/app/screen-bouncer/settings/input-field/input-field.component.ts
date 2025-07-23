import { Component, computed, input } from "@angular/core";
import { InputNumberOnlyDirective } from "../../../directives/input-number-only.directive";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "app-input-field",
  imports: [InputNumberOnlyDirective, ReactiveFormsModule],
  templateUrl: "./input-field.component.html",
  styleUrl: "./input-field.component.css"
})
export class InputFieldComponent {
  public type = input.required<string>();
  public control = input.required<FormControl>();
  public formID = computed(() => this.control.name + "-id")
  public label = input<string>()
}
