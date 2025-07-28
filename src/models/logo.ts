export const logoTypes = ["text", "image"] as const; //type will be inferred as ["text", "image"]
export type LogoType = typeof logoTypes[number]; //Index with number. This means the type can either be text OR image (union)

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
    typeConfig: {
        width: number,
        height: number,
        fileSource?: string,
        colorOpacity: number
    }
}

export interface LogoText extends LogoBase
{
    type: "text",
    typeConfig: {
        fontSize: number,
        displayText: string
    }
}

export type Logo = LogoImage | LogoText