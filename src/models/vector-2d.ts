export class Vector2D
{
    private _x: number;
    private _y: number;

    public get x(): number {return this._x};
    public set x(x) {this._x = x}
    public get y(): number {return this._y};
    public set y(y){this._y = y};

    constructor(x?: number, y?: number)
    {
        this._x = x ?? 0;
        this._y = y ?? 0;
    }

    public normalize()
    {
        const mag: number = Math.sqrt(this._x**2 + this.y**2)
        this.x /= mag
        this.y /= mag;
        return this
    }

    public static randomUnit(): Vector2D
    {
        const x: number = Math.random() * 2 - 1;
        const y: number = Math.random() * 2 - 1;
        return new Vector2D(x,y).normalize();
    }
}