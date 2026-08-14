import { ArrayMinSize, IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator"
import { ProcurementRequestPriority } from "../enums/procurement-request-priority.enum"
import { CreateProcurementRequestItemDto } from "./create-procurement-request-item.dto"
import { Type } from "class-transformer"

export class CreateProcurementRequestDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(200)
    title!: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsEnum(ProcurementRequestPriority)
    priority?: ProcurementRequestPriority

    @IsOptional()
    @IsDateString()
    needByDate?: string

    @IsArray()
    @ArrayMinSize(1) 
    @ValidateNested({
        each: true,
    })
    @Type(() => CreateProcurementRequestItemDto)
    items!: CreateProcurementRequestItemDto[]
}