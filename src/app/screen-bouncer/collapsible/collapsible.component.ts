import { Component, HostListener, output } from "@angular/core";
import { OptionsPaneComponent } from "../options-pane/options-pane.component";

@Component({
  selector: "app-collapsible",
  templateUrl: "./collapsible.component.html",
  styleUrl: "./collapsible.component.css",
  imports: [OptionsPaneComponent]
})
export class CollapsibleComponent {
  public isExpanded = false;
  public isVisible = false;
  private idleThreshold = 3 * 1000;
  private timeoutId: number | null = null;
  
  public clicked = output<boolean>();

  @HostListener("document:mousemove",["$event"])
  onMouseMove()
  {
    if(this.timeoutId) window.clearTimeout(this.timeoutId);
    else this.isVisible = true;
    
    this.timeoutId = window.setTimeout(() => {
      this.isVisible = false;
      this.timeoutId = null;
    }, this.idleThreshold);
  }

  onClicked()
  {
    this.isExpanded = !this.isExpanded;
    this.clicked.emit(this.isExpanded);
  }
}
