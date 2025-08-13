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
  //CONSTANTS
  public static readonly defaultSpeed: number = 500;
  public static readonly defaultBounceVar: number = 1;

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
  @HostBinding("style.color") private color = "white";
  @HostBinding("style.fill")
  public host: ElementRef = inject(ElementRef);

  ngOnInit(): void 
  {
    this.resetPosition();
    this.randomDirection();
  }

  randomDirection()
  {
    this.direction = Vector2D.randomUnit();
  }

  resetPosition()
  {
    this.setXPos(window.innerWidth / 2);
    this.setYPos(window.innerHeight / 2);
  }

  private clamp(val: number,min: number,max: number)
  {
    return Math.min(max, Math.max(min,val));
  }

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


  private setXPos(x: number)
  {
    const width: number = this.host.nativeElement.offsetWidth;
    this.left = (x - width/2);
  }

  private setYPos(y: number)
  {
    const height: number = this.host.nativeElement.offsetHeight;
    this.top = (y - height/2);
  }
}
