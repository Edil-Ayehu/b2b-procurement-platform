import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { OrganizationsService } from "../organizations.service";
import { OrganizationPermission } from "../enums/organization-permission.enum";
import { ORGANIZATION_PERMISSIONS_KEY } from "../decorators/require-permission.decorator";
import { ROLE_PERMISSIONS } from "../constants/role-permissions.constant";

@Injectable()
export class OrganizationPermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,

        private readonly organizationsService: OrganizationsService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const requiredPermissions = this.reflector.getAllAndOverride<OrganizationPermission[]>(
            ORGANIZATION_PERMISSIONS_KEY,
            [
                context.getHandler(),
                context.getClass(),
            ],
        );

        // If endpoint doesn't require organization permissions, allow it
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        const user = request.user;

        if (!user) {
            throw new ForbiddenException("Authenticated user is required");
        }

        const organizationId = request.params.organizationId

        if (!organizationId) {
            throw new ForbiddenException('Organization ID is required');
        }

        const membership = await this.organizationsService.findMembership(
            organizationId,
            user.id
        );

        if (!membership) {
            throw new ForbiddenException('You are not a member of this organization!')
        }

        if (!membership.isActive) {
            throw new ForbiddenException('Your organization membership is inactive!')
        }

        if (!membership.organization || !membership.organization.isActive) {
            throw new ForbiddenException('Organization is inactive');
        }

        const rolePermissions = ROLE_PERMISSIONS[membership.role] ?? [];

        const hasAllPermissions = requiredPermissions.every((permission) => rolePermissions.includes(permission));

        if (!hasAllPermissions) {
            throw new ForbiddenException('You do not have permission to perform this action!')
        }

        // Store membership on request so controllers/services can reuse it without querying the database again
        request.organizationMembership = membership;

        return true;
    }
}