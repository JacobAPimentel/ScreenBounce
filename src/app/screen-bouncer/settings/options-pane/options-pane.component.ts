import { Component, inject, model, OnInit } from "@angular/core";
import { LogoConfigComponent } from "../logo-config/logo-config.component";
import { LogosCacheService } from "../../../../services/logos-cache.service";
import { DatabaseService } from "../../../../services/database.service";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { InputFieldColorComponent } from "../input-fields/input-field-color/input-field-color.component";
import { CustomValidators } from "../../../../models/custom-validators";

@Component({
  selector: "app-options-pane",
  imports: [ReactiveFormsModule, LogoConfigComponent, InputFieldColorComponent],
  templateUrl: "./options-pane.component.html",
  styleUrl: "./options-pane.component.css"
})
export class OptionsPaneComponent implements OnInit
{
  //If you add more settings, you should do a General Setting service instead rather than having tons of model signals that the parents need to listen to.
  colorModel = model(localStorage.getItem("backgroundColor") ?? "#000000");

  formBuilder = inject(FormBuilder);
  generalForm = this.formBuilder.group({
    backgroundColor: [localStorage.getItem("backgroundColor") ?? "#000000",CustomValidators.isHex]
  },{updateOn: "change"});

  cache = inject(LogosCacheService);
  db = inject(DatabaseService);

  ngOnInit(): void 
  {
    this.generalForm.controls.backgroundColor.statusChanges.subscribe((status) => 
    {
      if(status === "INVALID") return;
      const color = this.generalForm.controls.backgroundColor.value ?? "#000000";
      localStorage.setItem("backgroundColor",color);
      this.colorModel.set(color);
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