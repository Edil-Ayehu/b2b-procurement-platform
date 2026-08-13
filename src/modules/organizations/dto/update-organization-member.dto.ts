import { IsEnum } from "class-validator";
import { OrganizationRole } from "../enums/organization-role.enum";

export class UpdateOrganizationMemberDto {
    @IsEnum(OrganizationRole)
    role!: OrganizationRole
}