import { SetMetadata } from "@nestjs/common";
import { OrganizationPermission } from "../enums/organization-permission.enum";

export const ORGANIZATION_PERMISSIONS_KEY = 'organization_permissions'

export const RequirePermission = (
    ...permissions: OrganizationPermission[]
) => SetMetadata(
    ORGANIZATION_PERMISSIONS_KEY,
    permissions,
)