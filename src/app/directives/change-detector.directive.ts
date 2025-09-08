import { ChangeDetectorRef, Directive, DoCheck, HostBinding, HostListener, inject } from "@angular/core";

@Directive()
export class ChangeDetectorDirective implements DoCheck 
{
  private cd = inject(ChangeDetectorRef);

  @HostBinding("class.renderFlash") private renderFlash = false;
  private animating = false;

  public ngDoCheck(): void 
  {
    if (this.animating) return;

    this.renderFlash = true;
    this.animating = true;
  }

  /**
   * When the outlineFlash animation ends, remove the animation flash.
   * 
   * @param event - the AnimationEvent
   * @returns void
   */
  @HostListener("animationend", ["$event"])
  private animationEnded(event: AnimationEvent): void 
  {
    if (event.animationName !== "outlineFlash") return;

    this.renderFlash = false;
    setTimeout(() => 
    {
      this.animating = false;
    });
  }
}