import { AbstractControl, ValidationErrors } from "@angular/forms";

export class CustomValidators
{
  /**
   * Determine if an input is a valid number.
   * 
   * @param control - The control directive. Intended cases are input elements.
   * @returns 
   * If a number, null.
   * Else, notANumber flag.
   */
  public static isNumber(control: AbstractControl): ValidationErrors | null
  {
    if(/^-?\d*\.?\d+$/.test(control.value)) return null;
    return {notANumber: true};
  }

  /**
   * Determine if an input is a hex.
   * 
   * @param control - The control directive. Intended cases are input elements.
   * @returns 
   * If a hex code, null.
   * Else, notHex flag.
   */
  public static isHex(control: AbstractControl): ValidationErrors | null
  {
    if(/^#.{6}$/.test(control.value)) return null;
    return {notHex: true};
  }
}