import { NgTemplateOutlet } from "@angular/common";
import { Component, ContentChild, HostListener, TemplateRef } from "@angular/core";

@Component({
  selector: "app-collapsible",
  templateUrl: "./collapsible.component.html",
  styleUrl: "./collapsible.component.css",
  imports: [NgTemplateOutlet]
})
export class CollapsibleComponent 
{
  public isExpanded = false;
  public isVisible = false;
  public isTransitioning = false;
  private idleThreshold = 3 * 1000;
  private timeoutId: number | null = null;

  @ContentChild("content") content!: TemplateRef<unknown>;

  @HostListener("document:mousemove",["$event"])
  onMouseMove()
  {
    if(this.timeoutId) window.clearTimeout(this.timeoutId);
    else this.isVisible = true;
    
    this.timeoutId = window.setTimeout(() => 
    {
      this.isVisible = false;
      this.timeoutId = null;
    }, this.idleThreshold);
  }

  onClicked()
  {
    this.isExpanded = !this.isExpanded;

    //We do not want media query breakpoints to trigger the transition. Therefore, the transition is only active for onClicked().
    this.isTransitioning = true;
  }

  transitionEnded()
  {
    this.isTransitioning = false;
  }
}
