"use server";

import { currentUser } from "@clerk/nextjs/server";
import { canRefundPurchases } from "../permissions/lessons";
import { getCurrentUser } from "@/src/services/clerk";
import { updatePurchase } from "../purchase";
import { stripeServerClient } from "@/src/services/stripe/stripeServer";
import { revokeUserCourseAccess } from "../../courses/db/userCourseAccess";

export async function refundPurchase(id: string) {
  if (!canRefundPurchases(await getCurrentUser())) {
    return {
      error: true,
      message: "There was an error refunding this purchase",
    };
  }

  try {
    const refundedPurchase = await updatePurchase(id, {
      refundedAt: new Date(),
    });

    const session = await stripeServerClient.checkout.sessions.retrieve(
      refundedPurchase.stripeSessionId,
    );

    if (session.payment_intent == null) {
      return {
        error: true,
        message: "There was an error refunding this purchase",
      };
    }

    try {
      await stripeServerClient.refunds.create({
        payment_intent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id,
      });

      await revokeUserCourseAccess(refundedPurchase);
    } catch {
      return {
        error: true,
        message: "There was an error refunding this purchase",
      };
    }
  } catch {
    return {
      error: true,
      message: "is not sucessed",
    };
  }
}
