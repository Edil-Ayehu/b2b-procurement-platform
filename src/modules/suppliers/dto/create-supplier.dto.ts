import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, MaxLength } from "class-validator";
import { SupplierType } from "../enums/supplier-type.enum";

export class CreateSupplierDto {
    @IsUUID()
    categoryId!: string

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name!: string

    @IsOptional()
    @IsEnum(SupplierType)
    type?: SupplierType

    @IsOptional()
    @IsString()
    @MaxLength(100)
    registrationNumber?: string

    @IsOptional()
    @IsString()
    @MaxLength(100)
    taxIdentificationNumber?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    industry?: string

    @IsOptional()
    @IsString()
    @MaxLength(100)
    country?: string

    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(150)
    email?: string;

    @IsOptional()
    @IsUrl()
    @MaxLength(255)
    website?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}