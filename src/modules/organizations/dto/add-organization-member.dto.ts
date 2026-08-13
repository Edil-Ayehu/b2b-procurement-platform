import { IsEmail, IsEnum } from "class-validator"
import { OrganizationRole } from "../enums/organization-role.enum"

export class AddOrganizationMemberDto {
    @IsEmail()
    email!: string

    @IsEnum(OrganizationRole)
    role!: OrganizationRole
}