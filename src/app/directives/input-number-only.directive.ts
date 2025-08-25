import { Directive, HostListener, input } from "@angular/core";

@Directive({
  selector: "[appInputNumberOnly]"
})
export class InputNumberOnlyDirective 
{
  //Properties
  public decimals = input<boolean>(true);

  /**
   * Determine if the input is valid.
   * 
   * @remarks
   *  If decimals: ^-?[0-9.]*$
   *  Else, ^-?[0-9]*$
   * 
   * @param str - The input string to be tested.
   * @returns True if the input is valid.
   */
  private isValidInput(str: string): boolean
  {
    return new RegExp("^-?[0-9"
                      + (this.decimals() ? "." : "")
                      +"]*$").test(str);
  }

  /**
   * Determine if the user event (typed in, pasted in, or dragged in) is valid.
   * If it is not valid, prevent the event from occurring.
   * 
   * @param event - The event that was called
   * @returns void
   */
  @HostListener("keypress",["$event"])
  @HostListener("paste",["$event"])
  @HostListener("drop",["$event"])
  public handleEvent(event: KeyboardEvent | ClipboardEvent | DragEvent): void
  {
    let str: string | undefined;
    if(event instanceof KeyboardEvent)
      str = event.key;
    else if(event instanceof ClipboardEvent)
      str = event.clipboardData?.getData("text");
    else
      str = event.dataTransfer?.getData("text");

    if(!str || this.isValidInput(str)) return;
    event.preventDefault();
  }
}
