import { Component, ElementRef, inject, ViewChild } from "@angular/core";
import {ReactiveFormsModule, FormBuilder} from "@angular/forms";
import { DvdLogoComponent } from "../../dvd-logo/dvd-logo.component";
import { InputFieldComponent } from "../input-field/input-field.component";
import { CustomValidators } from "../../../../models/custom-validators";

@Component({
  selector: "app-logo-config-box",
  imports: [ReactiveFormsModule, InputFieldComponent],
  templateUrl: "./logo-config-box.component.html",
  styleUrl: "./logo-config-box.component.css"
})
export class LogoConfigBoxComponent {
  @ViewChild("nameField") nameField!: ElementRef;

  formBuilder = inject(FormBuilder);
  configForm = this.formBuilder.group({
    name: "Default Logo",
    speed: [DvdLogoComponent.defaultSpeed,CustomValidators.isNumber],
    bounce: [DvdLogoComponent.defaultBounceVar,CustomValidators.isNumber]
  },{updateOn: "change"})

  public selectName()
  {
    this.nameField.nativeElement.select();
  }
}
