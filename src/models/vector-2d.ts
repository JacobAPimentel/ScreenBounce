export class Vector2D
{
    private _x: number;
    private _y: number;

    public get x(): number {return this._x;}
    public set x(x) {this._x = x;}
    
    public get y(): number {return this._y;}
    public set y(y){this._y = y;};

    /**
     * Set X and Y. Default to 0 if an axis is not defined.
     * 
     * @param x
     * @param y 
     */
    constructor(x?: number, y?: number)
    {
        this._x = x ?? 0;
        this._y = y ?? 0;
    }

    /**
     * Normalize the 2D vector.
     * 
     * @returns The normalized 2D vector.
     */
    public normalize()
    {
        const mag: number = Math.sqrt(this._x**2 + this.y**2);
        this.x /= mag;
        this.y /= mag;
        return this;
    }

    /**
     * Generate and return a randomized Vector2D
     * 
     * @returns A Vector2D with a randomized normalized X and Y.
     */
    public static randomUnit(): Vector2D
    {
        const x: number = Math.random() * 2 - 1; // -1 to 1
        const y: number = Math.random() * 2 - 1;
        return new Vector2D(x,y).normalize();
    }
}