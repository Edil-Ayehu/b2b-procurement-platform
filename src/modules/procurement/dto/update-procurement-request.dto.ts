import { ArrayMinSize, IsArray, IsDateString, IsEnum, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator"
import { ProcurementRequestPriority } from "../enums/procurement-request-priority.enum"
import { CreateProcurementRequestItemDto } from "./create-procurement-request-item.dto"
import { Type } from "class-transformer"

export class UpdateProcurementRequestDto {

    @IsOptional()
    @IsString()
    @MaxLength(200)
    title?: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsEnum(ProcurementRequestPriority)
    priority?: ProcurementRequestPriority

    @IsOptional()
    @IsDateString()
    neededByDate?: string

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({
        each: true,
    })
    @Type(() => CreateProcurementRequestItemDto)
    items?: CreateProcurementRequestItemDto[]
}