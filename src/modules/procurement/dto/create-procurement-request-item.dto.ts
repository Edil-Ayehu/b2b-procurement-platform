import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator"

export class CreateProcurementRequestItemDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name!: string

    @IsString()
    @IsOptional()
    description?: string

    @IsNumber()
    @Min(0.01)
    quantity!: number

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    unit!: string

    @IsOptional()
    @IsNumber()
    @Min(0)
    estimatedUnitPrice?: number

    @IsOptional()
    @IsString()
    @MaxLength(3)
    currency?: string

    @IsOptional()
    @IsString()
    notes?: string;
}