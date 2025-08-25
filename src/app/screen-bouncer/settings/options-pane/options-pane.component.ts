import { Component, inject, OnInit } from "@angular/core";
import { LogoConfigComponent } from "../logo-config/logo-config.component";
import { LogosCacheService } from "../../../../services/logos-cache.service";
import { DatabaseService } from "../../../../services/database.service";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { InputFieldColorComponent } from "../input-fields/input-field-color/input-field-color.component";
import { CustomValidators } from "../../../../models/custom-validators";
import { BackgroundService } from "../../../../services/background.service";

@Component({
  selector: "app-options-pane",
  imports: [ReactiveFormsModule, LogoConfigComponent, InputFieldColorComponent],
  templateUrl: "./options-pane.component.html",
  styleUrl: "./options-pane.component.css"
})
export class OptionsPaneComponent implements OnInit
{
  //Dependencies
  protected background = inject(BackgroundService);
  protected formBuilder = inject(FormBuilder);
  protected cache = inject(LogosCacheService);
  protected db = inject(DatabaseService);

  protected generalForm = this.formBuilder.group({
    backgroundColor: [this.background.backgroundColor(),CustomValidators.isHex]
  },{updateOn: "change"});

  /**
   * On init, listen to the background color changes and properly update it.
   */
  public ngOnInit(): void 
  {
    this.generalForm.controls.backgroundColor.statusChanges.subscribe((status) => 
    {
      if(status === "INVALID") return;
      const color = this.generalForm.controls.backgroundColor.value ?? "#000000";
      this.background.setBackgroundColor(color);
    });
  }

  /**
   * Revert the program to its default.
   */
  protected handleReset(): void
  {
    if(window.confirm("This will remove all logos. Are you sure?"))
    {
      this.db.clearAll();
    }
  }
}