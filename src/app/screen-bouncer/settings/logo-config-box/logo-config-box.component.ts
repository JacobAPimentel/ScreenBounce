import { Component, ElementRef, inject, input, OnInit, ViewChild } from "@angular/core";
import {ReactiveFormsModule, FormBuilder, FormControl} from "@angular/forms";
import { DvdLogoComponent } from "../../dvd-logo/dvd-logo.component";
import { CustomValidators } from "../../../../models/custom-validators";
import { DatabaseService } from "../../../../services/database.service";
import { Logo, LogoType, logoTypes } from "../../../../models/logo";
import { LogosCacheService } from "../../../../services/logos-cache.service";
import { InputFieldNumberComponent } from "../input-fields/input-field-number/input-field-number.component";
import { InputFieldSliderComponent } from "../input-fields/input-field-slider/input-field-slider.component";
import { InputFieldFileDropComponent } from "../input-fields/input-field-file-drop/input-field-file-drop.component";
import { InputFieldLabelComponent } from "../input-fields/input-field-label/input-field-label.component";
import { filter, map } from "rxjs";
import { LogoImageComponent } from "../../logo-image/logo-image.component";

@Component({
  selector: "app-logo-config-box",
  imports: [ReactiveFormsModule, InputFieldLabelComponent, InputFieldNumberComponent, InputFieldSliderComponent, InputFieldFileDropComponent],
  templateUrl: "./logo-config-box.component.html",
  styleUrl: "./logo-config-box.component.css"
})
export class LogoConfigBoxComponent implements OnInit 
{
  readonly logoTypes = logoTypes;
  logoModel = input.required<Logo>();

  aspectRatio: number = 1; // Width:Height
  lockRatio: boolean = false;
  @ViewChild("nameField") nameField!: ElementRef;

  dbCooldown = 100; //milliseconds
  dbTimeout: number | null = null;

  database = inject(DatabaseService);
  logoCache = inject(LogosCacheService);
  formBuilder = inject(FormBuilder);

  configImage = this.formBuilder.group({
    fileSource: "assets/DefaultLogo.svg",
    width: [500,CustomValidators.isNumber],
    height: [300,CustomValidators.isNumber],
    colorOpacity: [1,CustomValidators.isNumber]
  });

  configText = this.formBuilder.group({
    displayText: "DVD",
    fontSize: [50,CustomValidators.isNumber],
  });

  configForm = this.formBuilder.group({
    name: "Default Logo",
    type: "image",
    typeConfig: this.configImage as (typeof this.configImage | typeof this.configText),
    quantity: [1,CustomValidators.isNumber],
    speed: [DvdLogoComponent.defaultSpeed,CustomValidators.isNumber],
    bounceVariance: [DvdLogoComponent.defaultBounceVar,CustomValidators.isNumber],
  },{updateOn: "change"});

  ngOnInit(): void 
  {
    this.applyConfig(this.logoModel().type);
    this.configForm.patchValue(this.logoModel());
    this.toggleAspectRatio();

    //Changes will automatically be saved so the DVD logo can be reflected to the user near instantly.
    this.configForm.controls.type.valueChanges.subscribe((value) => 
    {
      this.applyConfig(value as LogoType);
    });

    const sizes = [this.configImage.controls.width,this.configImage.controls.height];
    for(let i = 0; i<sizes.length; i++)
    {
      const control = sizes[i];
      
      control.statusChanges.pipe(
        filter((status) => this.lockRatio && status === "VALID"),
        map(() => control.value)
      )
      .subscribe((curValue) => 
      {
        const other = sizes[((i + 1) % 2)];
        const otherVal = other === this.configImage.controls.width
                          ? curValue! / this.aspectRatio
                          : curValue! * this.aspectRatio;

        other.setValue(Number((otherVal).toFixed(2)),{emitEvent: false});
      });
    }

    this.configForm.statusChanges.subscribe(this.updateModelAndDatabase.bind(this));
  }

  public updateModelAndDatabase()
  {
      if(this.configForm.status === "INVALID") return;

      const formObject = this.configForm.getRawValue();
      Object.assign(this.logoModel(),formObject);

      //With the near real-time database update, if the user spam certain actions (such as the slider), it will constantly write to the database.
      //Therefore, implement a small cooldown that starts when the user stops modifying the status.
      if(this.dbTimeout)
      {
        clearTimeout(this.dbTimeout);
        this.dbTimeout = null;
      }

      this.dbTimeout = window.setTimeout(() => 
      {
        this.dbTimeout = null;
        this.database.modifyLogo(this.logoModel());
      },this.dbCooldown);
  }

  public uploadFile(file: File)
  {
    if(file.size > (5 * 1e6))
    {
      window.alert("File size exceeded 5 megabytes");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => 
    {
      const content = event.target!.result as string;
      this.configImage.controls.fileSource.setValue(content);

      const img = new Image();
      img.onload = () => 
      {
        const [width,height] = LogoImageComponent.determineSpawnSize(img.width,img.height);
        img.remove();

        this.configImage.controls.width.setValue(width,{emitEvent: false});
        this.configImage.controls.height.setValue(height,{emitEvent: false});

        this.setAspectRatio();
        this.updateModelAndDatabase();
      };
      img.src = content;
    };
  }

  public applyConfig(type: LogoType)
  {
    this.configForm.setControl("typeConfig",type === "image" ? this.configImage : this.configText);
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

  public setAspectRatio()
  {
    this.aspectRatio = this.configImage.controls.height.value! / this.configImage.controls.width.value!;
  }

  public toggleAspectRatio()
  {
    this.lockRatio = !this.lockRatio;

    if(this.lockRatio && this.configImage.valid)
    {
      this.setAspectRatio();
    }
  }

  //Alternatve form than directly doing "config.controls[x]"
  public getControl(formName: string, groupName?: string): FormControl
  {
    const controlName = (groupName ? `${groupName}.` : "") + formName;
    const formControl = this.configForm.get(controlName);
    if(formControl instanceof FormControl)
    {
      return formControl;
    }
    throw new Error("Form Control " + formName + " not found!");
  }

}
