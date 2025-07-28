import { AfterViewInit, Component, ElementRef, inject, input, OnInit, ViewChild } from "@angular/core";
import {ReactiveFormsModule, FormBuilder, FormControl} from "@angular/forms";
import { DvdLogoComponent } from "../../dvd-logo/dvd-logo.component";
import { InputFieldComponent } from "../input-field/input-field.component";
import { CustomValidators } from "../../../../models/custom-validators";
import { DatabaseService } from "../../../../services/database.service";
import { Logo, LogoType, logoTypes } from "../../../../models/logo";
import { LogosCacheService } from "../../../../services/logos-cache.service";
import { InputFieldLabelComponent } from "../input-field-label/input-field-label.component";
import { InputNumberOnlyDirective } from "../../../directives/input-number-only.directive";
import { InputFieldNumberComponent } from "../input-fields/input-field-number/input-field-number.component";
import { InputFieldSliderComponent } from "../input-fields/input-field-slider/input-field-slider.component";
import { InputFieldFileDropComponent } from "../input-fields/input-field-file-drop/input-field-file-drop.component";

@Component({
  selector: "app-logo-config-box",
  imports: [ReactiveFormsModule, InputFieldComponent, InputFieldLabelComponent, InputNumberOnlyDirective, InputFieldNumberComponent, InputFieldSliderComponent, InputFieldFileDropComponent],
  templateUrl: "./logo-config-box.component.html",
  styleUrl: "./logo-config-box.component.css"
})
export class LogoConfigBoxComponent implements OnInit {
  readonly logoTypes = logoTypes;
  logoModel = input.required<Logo>()

  @ViewChild("nameField") nameField!: ElementRef;

  database = inject(DatabaseService);
  logoCache = inject(LogosCacheService);
  formBuilder = inject(FormBuilder);

  configImage = this.formBuilder.group({
    fileSource: "assets/DefaultLogo.svg",
    width: [500,CustomValidators.isNumber],
    height: [300,CustomValidators.isNumber],
    colorOpacity: [1,CustomValidators.isNumber]
  })

  configText = this.formBuilder.group({
    displayText: "DVD",
    fontSize: [50,CustomValidators.isNumber],
  })

  configForm = this.formBuilder.group({
    name: "Default Logo",
    type: "image",
    typeConfig: this.configImage as (typeof this.configImage | typeof this.configText),
    speed: [DvdLogoComponent.defaultSpeed,CustomValidators.isNumber],
    bounceVariance: [DvdLogoComponent.defaultBounceVar,CustomValidators.isNumber],
  },{updateOn: "change"})

  ngOnInit(): void {
    this.applyConfig(this.logoModel().type)
    this.configForm.patchValue(this.logoModel());

    //Changes will automatically be saved so the DVD logo can be reflected to the user near instantly.
    this.configForm.controls.type.valueChanges.subscribe((value) => {
      this.applyConfig(value as LogoType)
    })

    this.configForm.statusChanges.subscribe((status) => {
       if(status === "INVALID") return;
       
       const formObject = this.configForm.getRawValue();
       Object.assign(this.logoModel(),formObject)
       this.database.modifyLogo(this.logoModel());
    })
  }

  public uploadFile(file: File)
  {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const content = event.target!.result
      this.configImage.controls.fileSource.setValue(content as string)
    }
  }

  public applyConfig(type: LogoType)
  {
    this.configForm.setControl("typeConfig",type === "image" ? this.configImage : this.configText)
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

  //Alternatve form than directly doing "config.controls[x]"
  public getControl(formName: string, groupName?: string): FormControl
  {
    const controlName = (groupName ? `${groupName}.` : "") + formName
    const formControl = this.configForm.get(controlName)
    if(formControl instanceof FormControl)
    {
      return formControl;
    }
    throw new Error("Form Control " + formName + " not found!")
  }

}
