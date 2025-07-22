type LogoType = "text" | "image";

export interface LogoBase
{
    id?: number,
    name: string,
    type: LogoType,

    speed: number,
    bounceVariance: number
}

export interface LogoImage extends LogoBase
{
    type: "image",
    width: number,
    height: number,
    source: string
}

export interface LogoText extends LogoBase
{
    type: "text",
    fontSize: number,
    text: string
}

export type Logo = LogoImage | LogoText