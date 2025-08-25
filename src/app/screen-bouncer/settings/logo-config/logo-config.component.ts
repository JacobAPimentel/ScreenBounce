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
  selector: "app-logo-config",
  imports: [ReactiveFormsModule, InputFieldLabelComponent, InputFieldNumberComponent, InputFieldSliderComponent, InputFieldFileDropComponent],
  templateUrl: "./logo-config.component.html",
  styleUrl: "./logo-config.component.css"
})
export class LogoConfigComponent implements OnInit 
{
  //Constants
  public static readonly MAX_FILE_SIZE = 5 * 1e6;
  //Properties
  public readonly logoTypes = logoTypes;
  public logoModel = input.required<Logo>();

  protected lockRatio = false;
  private aspectRatio = 1; // Width:Height
  @ViewChild("nameField") private nameField!: ElementRef;

  private dbCooldown = 100; //milliseconds
  private dbTimeout: number | null = null;

  //Dependencies
  protected database = inject(DatabaseService);
  protected logoCache = inject(LogosCacheService);
  protected formBuilder = inject(FormBuilder);

  //Control forms
  protected configImage = this.formBuilder.group({
    fileSource: "assets/DefaultLogo.svg",
    width: [500,CustomValidators.isNumber],
    height: [300,CustomValidators.isNumber],
    colorOpacity: [1,CustomValidators.isNumber]
  });

  protected configText = this.formBuilder.group({
    displayText: "DVD",
    fontSize: [50,CustomValidators.isNumber],
  });

  protected configForm = this.formBuilder.group({
    name: "Default Logo",
    type: "image",
    typeConfig: this.configImage as (typeof this.configImage | typeof this.configText),
    quantity: [1,CustomValidators.isNumber],
    speed: [DvdLogoComponent.defaultSpeed,CustomValidators.isNumber],
    bounceVariance: [DvdLogoComponent.defaultBounceVar,CustomValidators.isNumber],
  },{updateOn: "change"});

  /**
   * Init the config box and listens to the necessary listeners.
   */
  public ngOnInit(): void 
  {
    this.applyConfigType(this.logoModel().type);
    this.configForm.patchValue(this.logoModel());
    this.toggleAspectRatio();

    //Changes will automatically be saved so the DVD logo can be reflected to the user near instantly.
    this.configForm.controls.type.valueChanges.subscribe((value) => 
    {
      this.applyConfigType(value as LogoType);
    });

    //Aspect ratio listener
    const sizes = [this.configImage.controls.width,this.configImage.controls.height];
    for(let i = 0; i<sizes.length; i++)
    {
      const control = sizes[i];
      
      control.statusChanges.pipe(
        filter((status) => this.lockRatio && status === "VALID"), //Only listens to call when aspect ratio is enabled + change is valid.
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

    //If the main form changes, update the cache model and database.
    this.configForm.statusChanges.subscribe(this.updateModelAndDatabase.bind(this));
  }

  /**
   * Update the cache model and database, only if the current status is valid.
   * 
   * @returns void
   */
  public updateModelAndDatabase(): void
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

      this.dbTimeout = window.setTimeout((): void =>
      {
        this.dbTimeout = null;
        this.database.modifyLogo(this.logoModel());
      },this.dbCooldown);
  }

  /**
   * Process and upload file to the database.
   * 
   * @param file - The file that was uploaded.
   * @returns void
   */
  public uploadFile(file: File): void
  {
    if(file.size > LogoConfigComponent.MAX_FILE_SIZE)
    {
      window.alert("File size exceeded 5 megabytes");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event): void => 
    {
      const content = event.target!.result as string;
      this.configImage.controls.fileSource.setValue(content);

      // Uses img tag to get the img.width and img.height.
      const img = new Image();
      img.onload = (): void =>
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

  /**
   * Apply the config type to the general config form.
   * 
   * @param type - The current type that the config form is displaying.
   */
  public applyConfigType(type: LogoType): void
  {
    this.configForm.setControl("typeConfig",type === "image" ? this.configImage : this.configText);
  }

  /**
   * Create a new logo.
   */
  public createNewLogo(): void
  {
    this.database.createNewLogo();
  }

  /**
   * Delete this logo.
   */
  public deleteLogo(): void
  {
    this.database.deleteLogo(this.logoModel().id!);
  }

  /**
   * Clone this logo.
   */
  public cloneLogo(): void
  {
    this.database.cloneLogo(this.logoModel().id!);
  }

  /**
   * Set the current aspect ratio based on the current width / height of the logo.
   */
  public setAspectRatio(): void
  {
    this.aspectRatio = this.configImage.controls.height.value! / this.configImage.controls.width.value!;
  }

  /**
   * Toggle the aspect ratio. If toggled on, then the aspect ratio will be calculated.
   */
  public toggleAspectRatio(): void
  {
    this.lockRatio = !this.lockRatio;

    if(this.lockRatio && this.configImage.valid)
    {
      this.setAspectRatio();
    }
  }

  /**
   * Alternatve form than directly doing "config.controls[x]"
   * 
   * Example: getControl("displayText","typeConfig")
   * 
   * @param formName - The form you want to retrieve
   * @param groupName - Optional, the specified group name.
   * @returns The control form.
   */
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
