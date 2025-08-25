import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

@Component({
  selector: "app-input-field-file-drop",
  imports: [],
  templateUrl: "./input-field-file-drop.component.html",
  styleUrl: "./input-field-file-drop.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputFieldFileDropComponent 
{
  //Outputs
  public uploaded = output<File>();

  //Properties
  public validTypes = ["png","jpeg","gif","svg","webp"].map((str) => "image/" + str);
  public hasLabel = input(true);

  /**
   * Emit the file that was added.
   * 
   * @param files - The files that should be emitted. We only care about files[0], as the user can only input one file.
   * @returns void
   */
  private emitFile(files?: FileList): void
  {
    if(!files || files.length == 0) return;
    
    const file = files[0];
    if(this.validTypes.includes(file.type))
    {
      this.uploaded.emit(file);
    }
  }

  /**
   * Makes the drag text "Copy"
   * 
   * @param event - The drag event
   */
  protected onDragOver(event: DragEvent): void
  {
    event.preventDefault();
    if(event.dataTransfer) 
    {
      event.dataTransfer.dropEffect = "copy";
    }
  }

  /**
   * Overwrite onDrop to instead handle the file.
   * 
   * @param event - Drag event
   */
  protected onDrop(event: DragEvent): void
  {
    event.preventDefault();
    this.emitFile(event.dataTransfer?.files);
  }

    /**
   * Overwrite onPaste to instead handle the file.
   * 
   * @param event - Paste event
   */
  protected onPaste(event: ClipboardEvent): void
  {
    event.preventDefault();
    this.emitFile(event.clipboardData?.files);
  }

  /**
   * Overwrite onSelected to instead handle the file.
   * 
   * @param event - Select event
   */
  protected onSelected(event: Event): void
  {
    const files: FileList | null = (event.target as HTMLInputElement).files;
    if(!files) return;
    this.emitFile(files);
  }

  /**
   * When the mouse hovers over the Click Area, give focus to the element.
   * This is necessary to allow pasting.
   * 
   * @param event - Mouse event
   * @param focus - Focus boolean. If true, focus. Else, blur it.
   */
  protected focusClickArea(event: MouseEvent,focus: boolean): void
  {
    if(focus)
    {
      (event.target as HTMLInputElement).focus();
    }
    else
    {
      (event.target as HTMLInputElement).blur();
    }
  }
}
