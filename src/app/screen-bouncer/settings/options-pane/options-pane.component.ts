import { AfterViewInit, Component, inject } from "@angular/core";
import { LogoConfigBoxComponent } from "../logo-config-box/logo-config-box.component";
import { LogosCacheService } from "../../../../services/logos-cache.service";
import { DatabaseService } from "../../../../services/database.service";

@Component({
  selector: "app-options-pane",
  imports: [LogoConfigBoxComponent],
  templateUrl: "./options-pane.component.html",
  styleUrl: "./options-pane.component.css"
})
export class OptionsPaneComponent
{
  cache = inject(LogosCacheService);
  db = inject(DatabaseService);

  handleReset()
  {
    if(window.confirm("This will remove all logos. Are you sure?"))
    {
      this.db.clearAll();
    }
  }
}