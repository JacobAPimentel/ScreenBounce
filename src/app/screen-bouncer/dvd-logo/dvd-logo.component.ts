import { CommonModule} from "@angular/common";
import { Component, ElementRef, inject, HostBinding, OnInit, ContentChild, input } from "@angular/core";
import { Vector2D } from "../../../models/vector-2d";
import { ColorableLogoComponent } from "../colorable-logo/colorable-logo.component";

@Component({
  selector: "app-dvd-logo",
  imports: [CommonModule],
  template: "<ng-content/>",
  styleUrl: "./dvd-logo.component.css"
})
export class DvdLogoComponent implements OnInit 
{
  //Constants
  public static readonly defaultSpeed: number = 500;
  public static readonly defaultBounceVar: number = 1;

  //Properties
  public speed = input(DvdLogoComponent.defaultSpeed);
  public bounceVariance = input(DvdLogoComponent.defaultBounceVar);
  private cornerFrameTolerance = 5;
  
  private elapsedXHit = Infinity;
  private elapsedYHit = Infinity;
  private direction: Vector2D = new Vector2D();

  private moveID = 0;

  @ContentChild(ColorableLogoComponent) innerLogo!: ColorableLogoComponent;

  @HostBinding("style.left.px") private left = 0;
  @HostBinding("style.top.px") private top = 0;
  @HostBinding("style.fill")
  public host: ElementRef = inject(ElementRef);

  /**
   * On init, center the logo and push it to a random direction.
   */
  ngOnInit(): void 
  {
    this.resetPosition();
    this.randomDirection();
  }

  /**
   * Set the logo to move in a random direction.
   */
  randomDirection()
  {
    this.direction = Vector2D.randomUnit();
  }

  /**
   * Center the logo.
   */
  resetPosition()
  {
    this.setXPos(window.innerWidth / 2);
    this.setYPos(window.innerHeight / 2);
  }

  /**
   * Return a number between min and max.
   * 
   * @param val - The value that should be clamped
   * @param min - The min bound
   * @param max - The max bound
   * @returns 
   * A number between min and max.
   */
  private clamp(val: number,min: number,max: number)
  {
    return Math.min(max, Math.max(min,val));
  }

  /**
   * Render the next logo frame.
   * 
   * @param dt - Delta time
   */
  public moveFrame(dt: DOMHighResTimeStamp)
  {
    const dtSpeed: number = this.speed() * dt;

    const x = this.left + (this.direction.x  * dtSpeed);
    const y = this.top + (this.direction.y * dtSpeed);

    this.elapsedXHit++;
    this.elapsedYHit++;
    this.evaluateHits(x,y);

    this.left = this.clamp(this.left + (this.direction.x * dtSpeed),0,this.host.nativeElement.parentElement.offsetWidth - this.host.nativeElement.offsetWidth);
    this.top = this.clamp(this.top + (this.direction.y * dtSpeed),0,this.host.nativeElement.parentElement.offsetHeight - this.host.nativeElement.offsetHeight);
  }

  /**
   * Will add a random variance towards the same direction.
   * If the initial is 0, the variance will either be positive or negative.
   * @param initial The current direction
   * @returns initial + the randomized variance factor.
   */
  private applyBounceVariance(initial: number)
  {
    const varianceSign = Math.abs(initial) <= Number.EPSILON 
                         ? (Math.random() < 0.5 ? -1 : 1) 
                         : Math.sign(initial);
    const varianceFactor = Math.random() * this.bounceVariance() * varianceSign;
    return initial + varianceFactor;
  }

  /**
   * Evaluate if the logo is currently hitting anything. If so, perform certain actions.
   * @param x X position of the logo
   * @param y Y position of the logo
   * @returns boolean
   */
  private evaluateHits(x: number,y: number): boolean
  {  
    const xWasHit: boolean = x <= 0 || x + this.host.nativeElement.offsetWidth >= this.host.nativeElement.parentElement.offsetWidth;
    const yWasHit: boolean = y <= 0 || y + this.host.nativeElement.offsetHeight >= this.host.nativeElement.parentElement.offsetHeight;
    if(!xWasHit && !yWasHit) return false;

    if(xWasHit)
    {
      this.elapsedXHit = 0;
      this.direction.x *= -1;
    }
    if(yWasHit)
    {
      this.elapsedYHit = 0;
      this.direction.y *= -1;
    }

    //Apply some variance
    this.direction.x = this.applyBounceVariance(this.direction.x);
    this.direction.y = this.applyBounceVariance(this.direction.y);

    if(this.elapsedXHit <= this.cornerFrameTolerance && this.elapsedYHit <= this.cornerFrameTolerance)
    {
      console.log("CORNER HIT!!!");
    }

    this.innerLogo.setRandomColor();
    this.direction.normalize();
    
    return true;
  }

  /**
   * Set the X position of the logo in respect to the logo width.
   * 
   * @param x - The X value to be set to.
   */
  private setXPos(x: number)
  {
    this.left = (x - this.host.nativeElement.offsetWidth/2);
  }

  /**
   * Set the Y position of the logo in respect to the logo height.
   * 
   * @param y - The Y value to be set to.
   */
  private setYPos(y: number)
  {
    this.top = (y - this.host.nativeElement.offsetHeight/2);
  }
}
