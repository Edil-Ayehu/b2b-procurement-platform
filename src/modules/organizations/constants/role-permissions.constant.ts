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
        OrganizationPermission.PROCUREMENT_SUBMIT,
        OrganizationPermission.PROCUREMENT_CANCEL,
        OrganizationPermission.PROCUREMENT_REJECT,
        OrganizationPermission.PROCUREMENT_UPDATE,

        OrganizationPermission.PURCHASE_ORDER_CREATE,
        OrganizationPermission.PURCHASE_ORDER_VIEW,
        OrganizationPermission.PURCHASE_ORDER_APPROVE,

        OrganizationPermission.FINANCE_VIEW,

        OrganizationPermission.SUPPLIER_CREATE,
        OrganizationPermission.SUPPLIER_VIEW,
        OrganizationPermission.SUPPLIER_UPDATE,
        OrganizationPermission.SUPPLIER_MANAGE_CONTACTS,
        OrganizationPermission.SUPPLIER_MANAGE_CATEGORIES,
    ],

    [OrganizationRole.PROCUREMENT_MANAGER] : [
        OrganizationPermission.ORGANIZATION_VIEW,

        OrganizationPermission.MEMBER_VIEW,

        OrganizationPermission.PROCUREMENT_CREATE,
        OrganizationPermission.PROCUREMENT_VIEW,
        OrganizationPermission.PROCUREMENT_APPROVE,
        OrganizationPermission.PROCUREMENT_SUBMIT,
        OrganizationPermission.PROCUREMENT_CANCEL,
        OrganizationPermission.PROCUREMENT_REJECT,
        OrganizationPermission.PROCUREMENT_UPDATE,

        OrganizationPermission.PURCHASE_ORDER_CREATE,
        OrganizationPermission.PURCHASE_ORDER_VIEW,

        OrganizationPermission.SUPPLIER_CREATE,
        OrganizationPermission.SUPPLIER_VIEW,
        OrganizationPermission.SUPPLIER_UPDATE,
        OrganizationPermission.SUPPLIER_MANAGE_CONTACTS,
        OrganizationPermission.SUPPLIER_MANAGE_CATEGORIES,
    ],

    [OrganizationRole.BUYER] : [
        OrganizationPermission.ORGANIZATION_VIEW,

        OrganizationPermission.PROCUREMENT_CREATE,
        OrganizationPermission.PROCUREMENT_VIEW,
        OrganizationPermission.PROCUREMENT_UPDATE,
        OrganizationPermission.PROCUREMENT_SUBMIT,
        OrganizationPermission.PROCUREMENT_CANCEL,

        OrganizationPermission.PURCHASE_ORDER_VIEW,

        OrganizationPermission.SUPPLIER_VIEW,
        OrganizationPermission.SUPPLIER_MANAGE_CONTACTS,
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

        OrganizationPermission.SUPPLIER_VIEW,
    ],
}