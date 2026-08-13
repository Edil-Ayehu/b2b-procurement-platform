import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { OrganizationsService } from "../organizations.service";
import { OrganizationRole } from "../enums/organization-role.enum";
import { ORGANIZATION_ROLES_KEY } from "../decorators/organization-roles.decorator";

@Injectable()
export class OrganizationRoleGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,

        private readonly organizationService: OrganizationsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(
            ORGANIZATION_ROLES_KEY,
            [
                context.getHandler(),
                context.getClass(),
            ]
        );

        if (!requiredRoles?.length) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        const user = request.user;

        const organizationId = request.params.organizationId;

        if (!organizationId) {
            throw new ForbiddenException('Organization ID is required');
        }

        const membership = await this.organizationService.findMembership(
            organizationId,
            user.id,
        );

        if (!membership) {
            throw new ForbiddenException("You are not a member of this organization")
        }

        if (!membership.isActive) {
            throw new ForbiddenException("Your organization membership is inactive")
        }

        if (!requiredRoles.includes(membership.role)) {
            throw new ForbiddenException("You don't have permission to perform this action.")
        }


        request.organizationMembership = membership;

        return true;
    }
}