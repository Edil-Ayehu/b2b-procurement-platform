import { OrganizationPermission } from "../enums/organization-permission.enum";
import { OrganizationRole } from "../enums/organization-role.enum";

export const ROLE_PERMISSIONS: Record<
   OrganizationRole,
   OrganizationPermission[]
> = {
    [OrganizationRole.OWNER] : [...Object.values(OrganizationPermission)],

    [OrganizationRole.ADMIN] : [
        OrganizationPermission.ORGANIZATION_VIEW,
        OrganizationPermission.ORGANIZATION_UPDATE,

        OrganizationPermission.MEMBER_VIEW,
        OrganizationPermission.MEMBER_INVITE,
        OrganizationPermission.MEMBER_UPDATE,
        OrganizationPermission.MEMBER_REMOVE,

        OrganizationPermission.PROCUREMENT_CREATE,
        OrganizationPermission.PROCUREMENT_VIEW,
        OrganizationPermission.PROCUREMENT_APPROVE,

        OrganizationPermission.PURCHASE_ORDER_CREATE,
        OrganizationPermission.PURCHASE_ORDER_VIEW,
        OrganizationPermission.PURCHASE_ORDER_APPROVE,

        OrganizationPermission.FINANCE_VIEW,
    ],

    [OrganizationRole.PROCUREMENT_MANAGER] : [
        OrganizationPermission.ORGANIZATION_VIEW,

        OrganizationPermission.MEMBER_VIEW,

        OrganizationPermission.PROCUREMENT_CREATE,
        OrganizationPermission.PROCUREMENT_VIEW,
        OrganizationPermission.PROCUREMENT_APPROVE,

        OrganizationPermission.PURCHASE_ORDER_CREATE,
        OrganizationPermission.PURCHASE_ORDER_VIEW,
    ],

    [OrganizationRole.BUYER] : [
        OrganizationPermission.ORGANIZATION_VIEW,

        OrganizationPermission.PROCUREMENT_CREATE,
        OrganizationPermission.PROCUREMENT_VIEW,

        OrganizationPermission.PURCHASE_ORDER_VIEW,
    ],

    [OrganizationRole.FINANCE] : [
        OrganizationPermission.ORGANIZATION_VIEW,

        OrganizationPermission.PURCHASE_ORDER_VIEW,

         OrganizationPermission.FINANCE_VIEW,
    ],

    [OrganizationRole.VIEWER] : [
        OrganizationPermission.ORGANIZATION_VIEW,

        OrganizationPermission.PROCUREMENT_VIEW,

        OrganizationPermission.PURCHASE_ORDER_VIEW,
    ],
}