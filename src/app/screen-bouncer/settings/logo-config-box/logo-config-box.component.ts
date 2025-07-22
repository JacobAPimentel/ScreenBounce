import { AfterViewInit, Component, ElementRef, inject, input, ViewChild } from "@angular/core";
import {ReactiveFormsModule, FormBuilder} from "@angular/forms";
import { DvdLogoComponent } from "../../dvd-logo/dvd-logo.component";
import { InputFieldComponent } from "../input-field/input-field.component";
import { CustomValidators } from "../../../../models/custom-validators";
import { DatabaseService } from "../../../../services/database.service";
import { Logo } from "../../../../models/logo";
import { LogosCacheService } from "../../../../services/logos-cache.service";

@Component({
  selector: "app-logo-config-box",
  imports: [ReactiveFormsModule, InputFieldComponent],
  templateUrl: "./logo-config-box.component.html",
  styleUrl: "./logo-config-box.component.css"
})
export class LogoConfigBoxComponent implements AfterViewInit {
  logoModel = input.required<Logo>()

  @ViewChild("nameField") nameField!: ElementRef;

  database = inject(DatabaseService);
  logoCache = inject(LogosCacheService);
  formBuilder = inject(FormBuilder);
  configForm = this.formBuilder.group({
    name: "Default Logo",
    speed: [DvdLogoComponent.defaultSpeed,CustomValidators.isNumber],
    bounceVariance: [DvdLogoComponent.defaultBounceVar,CustomValidators.isNumber],
    width: [500,CustomValidators.isNumber],
    height: [300,CustomValidators.isNumber]
  },{updateOn: "change"})

  ngAfterViewInit(): void 
  {
    this.configForm.patchValue(this.logoModel());

    //Changes will automatically be saved so the DVD logo can be reflected to the user near instantly.
    this.configForm.statusChanges.subscribe((status) => {
       if(status === "INVALID") return;
       
       const formObject = this.configForm.getRawValue();
       Object.assign(this.logoModel(),formObject)
       this.database.modifyLogo(this.logoModel());
    })
  }

  public selectName()
  {
    this.nameField.nativeElement.select();
  }

  public createNewLogo()
  {
    this.database.createNewLogo();
  }

  public deleteLogo()
  {
    this.database.deleteLogo(this.logoModel().id!);
  }

  public cloneLogo()
  {
    this.database.cloneLogo(this.logoModel().id!);
  }
}
