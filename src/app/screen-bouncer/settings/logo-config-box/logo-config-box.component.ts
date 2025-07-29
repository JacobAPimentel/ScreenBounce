import { AfterViewInit, Component, ElementRef, inject, input, OnInit, ViewChild } from "@angular/core";
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
import { combineLatest, filter, map, pairwise, startWith } from "rxjs";

@Component({
  selector: "app-logo-config-box",
  imports: [ReactiveFormsModule, InputFieldLabelComponent, InputFieldNumberComponent, InputFieldSliderComponent, InputFieldFileDropComponent],
  templateUrl: "./logo-config-box.component.html",
  styleUrl: "./logo-config-box.component.css"
})
export class LogoConfigBoxComponent implements OnInit {
  readonly logoTypes = logoTypes;
  logoModel = input.required<Logo>()

  lockRatio = true;
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
    });

    //Slightly inefficient because I am always listening to this rather than simply listening only when ratio is toggled.
    let setByRatio = false;
    [this.configImage.controls.width,this.configImage.controls.height].forEach((control) => {
      control.statusChanges
      .pipe(
        startWith(control.value), // First previous should be the initial value.
        filter((status) => status === "VALID"), //If status is invalid, do not bother adding it to the pairwise.
        map(() => control.value), //We only care about the value.
        pairwise() // Return the pair of the previous value and current.
      )
      .subscribe(([prev,cur]) => {
        if(setByRatio)
        {
          setByRatio = false;
          return;
        }
        if(!this.lockRatio) return;
        const scale = cur!/prev! // Should be fine as prev/cur can only occur if status was VALID.
        const other = control === this.configImage.controls.width 
                      ? this.configImage.controls.height 
                      : this.configImage.controls.width;

        setByRatio = true;
        other.setValue(+((other.value || 100) * scale).toFixed(2))
      })
    });

    this.configForm.statusChanges.subscribe((status) => {
      //With the near real-time database update, if the user spam certain actions (such as the slider), it will constantly write to the database.
      //Therefore, implement a small cooldown that starts when the user stops modifying the status.
      if(this.dbTimeout)
      {
        clearTimeout(this.dbTimeout);
        this.dbTimeout = null;
      }
      if(status === "INVALID") return;

      const formObject = this.configForm.getRawValue();
      Object.assign(this.logoModel(),formObject);
      this.dbTimeout = window.setTimeout(() => {
        this.dbTimeout = null;
        this.database.modifyLogo(this.logoModel());
      },this.dbCooldown)
    })
  }

  public uploadFile(file: File)
  {
    if(file.size > (5 * 1e6))
    {
      window.alert("File size exceeded 5 megabytes")
      return
    }

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const content = event.target!.result as string
      this.configImage.controls.fileSource.setValue(content)

      const img = new Image()
      img.onload = () => {
        let width: number = img.width;
        let height: number = img.height;

        const highest = Math.max(img.width,img.height);
        if(highest > 500)
        {
          const scale = 500/highest
          width *= scale;
          height *= scale;
        }
        img.remove();

        const ratio = this.lockRatio//temp solution for now
        this.lockRatio = false; // remove later

        this.configImage.controls.width.setValue(+width.toFixed(2)) // The + will convert the sting to a number. It is similar to 0 + "foo"
        this.configImage.controls.height.setValue(+height.toFixed(2))

        this.lockRatio = ratio //remove later
      }
      img.src = content;
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

  public toggleAspectRatio()
  {
    this.lockRatio = !this.lockRatio
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
