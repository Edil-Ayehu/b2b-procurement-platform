import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentOrganizationMembership = createParamDecorator(
    (
        _data: unknown,
        ctx: ExecutionContext,
    ) => {
        const request = ctx.switchToHttp().getRequest();

        return request.params.membership;
    }
);