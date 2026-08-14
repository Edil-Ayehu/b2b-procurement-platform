import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RejectProcurementRequestDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(1000)
    reason!: string
}