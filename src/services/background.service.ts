import { computed, Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class BackgroundService
{
  public backgroundColor = signal(localStorage.getItem("backgroundColor") ?? "#000000");
  public iconColor = computed(() => this.determineIconColor(this.backgroundColor())); //

  /**
   * Set the background color to the localStorage and signal.
   * 
   * @param hexColor - The new background's hex color. 
   */
  public setBackgroundColor(hexColor: string)
  {
    localStorage.setItem("backgroundColor",hexColor);
    this.backgroundColor.set(hexColor);
  }

  /**
   * Determine what color icons should be based on the given lightness.
   * 
   * @param hexColor - The hexColor to verify.
   * @returns
   * If lightness is <= 0.5, white icon (#FFFFFF)
   * Else, return black icon (#000000)
   */
  private determineIconColor(hexColor: string)
  {
    const rgb = hexColor.slice(1) // remove #
                .match(/.{2}/g)! //Match all matches of two characters.
                .map((hex) => parseInt(hex,16)/255); //Retrieve the RGB version and normalize it

    const lightness = (Math.max(...rgb) + Math.min(...rgb))/2;
    return lightness <= 0.5 ? "#FFFFFF" : "#000000";
  }
}