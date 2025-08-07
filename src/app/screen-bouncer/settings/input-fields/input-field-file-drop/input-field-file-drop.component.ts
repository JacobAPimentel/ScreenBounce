import { ChangeDetectionStrategy, Component, ElementRef, output, ViewChild, viewChild } from "@angular/core";

@Component({
  selector: "app-input-field-file-drop",
  imports: [],
  templateUrl: "./input-field-file-drop.component.html",
  styleUrl: "./input-field-file-drop.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputFieldFileDropComponent 
{
  public validTypes = ["png","jpeg","gif","svg","webp"].map((str) => "image/" + str);
  public uploaded = output<File>();

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild("pasteArea") pasteArea!: ElementRef<HTMLInputElement>;

  onDragOver(event: DragEvent)
  {
    event.preventDefault();
    if (event.dataTransfer) 
    {
      event.dataTransfer.dropEffect = "copy";
    }
  }

  emitFile(files?: FileList)
  {
    if(!files || files.length == 0) return;
    
    const file = files[0];
    if(this.validTypes.includes(file.type))
    {
      this.uploaded.emit(file);
    }
  }

  onDrop(event: DragEvent)
  {
    event.preventDefault();
    this.emitFile(event.dataTransfer?.files);
  }

  onPaste(event: ClipboardEvent)
  {
    event.preventDefault();
    this.emitFile(event.clipboardData?.files);
  }

  onSelected(event: Event)
  {
    const files: FileList | null = (event.target as HTMLInputElement).files;
    if(!files) return;
    this.emitFile(files);
  }

  //If we want pasting, element need to be focused.
  focusClickArea(event: MouseEvent,focus: boolean)
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
