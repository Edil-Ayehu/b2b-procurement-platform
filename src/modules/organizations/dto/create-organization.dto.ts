import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class CreateOrganizationDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(150)
    name!: string

    @IsString()
    @IsOptional()
    @MaxLength(255)
    description?: string
}