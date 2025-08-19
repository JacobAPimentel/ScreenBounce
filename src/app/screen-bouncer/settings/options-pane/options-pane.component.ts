import { Component, inject, model, OnInit } from "@angular/core";
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
  background = inject(BackgroundService);
  formBuilder = inject(FormBuilder);
  generalForm = this.formBuilder.group({
    backgroundColor: [this.background.backgroundColor(),CustomValidators.isHex]
  },{updateOn: "change"});

  cache = inject(LogosCacheService);
  db = inject(DatabaseService);

  ngOnInit(): void 
  {
    this.generalForm.controls.backgroundColor.statusChanges.subscribe((status) => 
    {
      if(status === "INVALID") return;
      const color = this.generalForm.controls.backgroundColor.value ?? "#000000";
      this.background.setBackgroundColor(color);
    });
  }

  handleReset()
  {
    if(window.confirm("This will remove all logos. Are you sure?"))
    {
      this.db.clearAll();
    }
  }
}