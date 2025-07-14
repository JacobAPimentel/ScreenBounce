import { Directive, HostListener } from "@angular/core";

@Directive({
  selector: "[appInputNumberOnly]"
})
export class InputNumberOnlyDirective {
  private isPotentialNumberInput(str: string): boolean
  {
    return /^^-?[0-9.]*$/.test(str);
  }

  @HostListener("keypress",["$event"])
  @HostListener("paste",["$event"])
  @HostListener("drop",["$event"])
  public handleEvent(event: KeyboardEvent | ClipboardEvent | DragEvent)
  {
    let str: string | undefined;
    if(event instanceof KeyboardEvent)
      str = event.key;
    else if(event instanceof ClipboardEvent)
      str = event.clipboardData?.getData("text");
    else
      str = event.dataTransfer?.getData("text")

    if(!str || this.isPotentialNumberInput(str)) return;
    event.preventDefault();
  }
}
