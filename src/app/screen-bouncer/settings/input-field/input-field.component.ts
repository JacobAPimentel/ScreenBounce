import { Component, computed, input } from "@angular/core";
import { InputNumberOnlyDirective } from "../../../directives/input-number-only.directive";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "app-input-field",
  imports: [InputNumberOnlyDirective, ReactiveFormsModule],
  templateUrl: "./input-field.component.html",
  styleUrl: "./input-field.component.css"
})
export class InputFieldComponent {
  public formGroup = input.required<FormGroup>();
  public type = input.required<string>();
  public formName = input.required<string>(); // required() makes it not optional, which allows [formControlName]="formName()" to work.
  public formID = computed(() => this.formName() + "-id")
  public label = input<string>()
}
