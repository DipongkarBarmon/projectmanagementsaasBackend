import { Router } from "express";
import { BillingController } from "./billing.controller";
import { auth } from "../../middleware/checkAuth";
import { validationRequest } from "../../middleware/validationRequest";
import { createSubscriptionSchema, updateSubscriptionSchema } from "./billing.validation";
import { OrganizationRole } from "../../../../generated/prisma/enums";

const router = Router({ mergeParams: true });

router.get("/subscription", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN] }), BillingController.getSubscription);
router.post("/subscription", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN] }), validationRequest(createSubscriptionSchema), BillingController.createSubscription);
router.patch("/subscription", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN] }), validationRequest(updateSubscriptionSchema), BillingController.updateSubscription);

export const BillingRoutes = router;
