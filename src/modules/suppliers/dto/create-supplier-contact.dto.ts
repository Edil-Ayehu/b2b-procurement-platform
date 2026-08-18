import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateSupplierContactDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName!: string

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName!: string

    @IsOptional()
    @IsString()
    @MaxLength(100)
    jobTitle?: string;

    @IsEmail()
    @MaxLength(150)
    email!: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string;

    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean
}