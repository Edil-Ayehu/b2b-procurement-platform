import { IsOptional, IsString, MaxLength } from "class-validator";

export class ApproveProcurementRequestDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    comment?: string;
}