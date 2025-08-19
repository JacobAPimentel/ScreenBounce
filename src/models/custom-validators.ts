import { AbstractControl, ValidationErrors } from "@angular/forms";

export class CustomValidators
{
  public static isNumber(control: AbstractControl): ValidationErrors | null
  {
    if(/^-?\d*\.?\d+$/.test(control.value)) return null;
    return {notANumber: true};
  }

  public static isHex(control: AbstractControl): ValidationErrors | null
  {
    if(/^#.{6}$/.test(control.value)) return null;
    return {notHex: true};
  }
}