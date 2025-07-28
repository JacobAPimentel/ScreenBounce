import { Component, computed, ContentChild, input, TemplateRef } from "@angular/core";
import { InputNumberOnlyDirective } from "../../../directives/input-number-only.directive";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";

@Component({
  selector: "app-input-field",
  imports: [InputNumberOnlyDirective, ReactiveFormsModule, NgTemplateOutlet],
  templateUrl: "./input-field.component.html",
  styleUrl: "./input-field.component.css"
})
export class InputFieldComponent {
  public control = input.required<FormControl>();
  public type = input<string>();
  public id = input<string>(crypto.randomUUID())
  public label = input<string>()
  @ContentChild("content") content?: TemplateRef<unknown>;
}