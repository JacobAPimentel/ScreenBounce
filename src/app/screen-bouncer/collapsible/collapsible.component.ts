import { NgTemplateOutlet } from "@angular/common";
import { Component, ContentChild, HostListener, inject, TemplateRef } from "@angular/core";
import { BackgroundService } from "../../../services/background.service";

@Component({
  selector: "app-collapsible",
  templateUrl: "./collapsible.component.html",
  styleUrl: "./collapsible.component.css",
  imports: [NgTemplateOutlet]
})
export class CollapsibleComponent 
{
  //Properties
  public isExpanded = false;
  public isVisible = false;
  public isTransitioning = false;
  private idleThreshold = 3 * 1000;
  private timeoutId: number | null = null;

  //Dependencies
  public background = inject(BackgroundService);

  @ContentChild("content") content!: TemplateRef<unknown>;

  /**
   * On mouse move, make the settings logo visible.
   * 
   * Repeated mouse movement will reset the timeout.
   */
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

  /**
   * Settings icon on clicked; toggle expansion!
   * 
   * Also enables transition animations (property binding will add a transition css rule).
   */
  onClicked()
  {
    this.isExpanded = !this.isExpanded;

    //We do not want media query breakpoints to trigger the transition. Therefore, the transition is only active for onClicked().
    this.isTransitioning = true;
  }

  /**
   * Transition ended, remove transition rule from css (uses property bindings)
   */
  transitionEnded()
  {
    this.isTransitioning = false;
  }
}
