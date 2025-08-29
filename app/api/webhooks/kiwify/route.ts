import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

import crypto from "crypto";

interface KiwifyWebhookPayload {
  order_id: string;
  order_status: string;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    mobile: string;
    CPF: string;
  };
  Product: {
    product_name: string;
  };
  commissions: Array<{
    order_id: string;
    product_id: string;
    product_name: string;
    affiliate_email: string;
    producer_email: string;
    customer_email: string;
    order_status: string;
    sale_amount: number;
    sale_currency: string;
  }>;
}

function verifyKiwifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}

async function sendToExternalWebhook(userData: any) {
  const externalWebhookUrl = process.env.EXTERNAL_WEBHOOK_URL;

  if (!externalWebhookUrl) {
    console.log(
      "EXTERNAL_WEBHOOK_URL not configured, skipping external webhook"
    );
    return;
  }

  try {
    const response = await fetch(externalWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXTERNAL_WEBHOOK_TOKEN || ""}`,
      },
      body: JSON.stringify({
        event: "user_created",
        user: userData,
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      console.log("External webhook called successfully");
    } else {
      console.error(
        "External webhook failed:",
        response.status,
        await response.text()
      );
    }
  } catch (error) {
    console.error("Error calling external webhook:", error);
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Kiwify webhook endpoint is active",
    timestamp: new Date().toISOString(),
    endpoint: "/api/webhooks/kiwify"
  });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("X-Kiwify-Signature") || "";
    const kiwifySecret = process.env.KIWIFY_WEBHOOK_SECRET || "";

    if (!kiwifySecret) {
      console.error("KIWIFY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    if (!verifyKiwifySignature(rawBody, signature, kiwifySecret)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload: KiwifyWebhookPayload = JSON.parse(rawBody);

    console.log("Kiwify webhook received:", {
      orderId: payload.order_id,
      status: payload.order_status,
      customerEmail: payload.customer.email,
      productName: payload.Product.product_name,
    });

    if (payload.order_status !== "paid") {
      console.log(
        `Order ${payload.order_id} not paid, skipping account creation`
      );
      return NextResponse.json({ message: "Order not paid, skipping" });
    }

    const { customer } = payload;
    const fullName = `${customer.first_name} ${customer.last_name}`.trim();
    const clerk = (await clerkClient()).users;
    try {
      const user = await clerk.createUser({
        emailAddress: [customer.email],
        firstName: customer.first_name,
        lastName: customer.last_name,
        publicMetadata: {
          kiwifyOrderId: payload.order_id,
          productName: payload.Product.product_name,
          subscription: "active",
          type: "whitelabel",
          createdFromWebhook: true,
        },
        privateMetadata: {
          cpf: customer.CPF,
          mobile: customer.mobile,
        },
      });

      console.log(
        `User created in Clerk: ${user.id} for email: ${customer.email}`
      );

      console.log(`User record created in database for: ${customer.email}`);

      // Dispara webhook externo
      await sendToExternalWebhook({
        id: user.id,
        email: customer.email,
        name: fullName,
        kiwifyOrderId: payload.order_id,
        productName: payload.Product.product_name,
        subscription: "active",
        type: "whitelabel",
      });

      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        userId: user.id,
        orderId: payload.order_id,
      });
    } catch (clerkError: any) {
      if (clerkError.errors?.[0]?.code === "form_identifier_exists") {
        console.log(`User already exists for email: ${customer.email}`);

        const existingUsers = await clerk.getUserList({
          emailAddress: [customer.email],
        });

        if (existingUsers.data.length > 0) {
          const existingUser = existingUsers.data[0];

          await clerk.updateUserMetadata(existingUser.id, {
            publicMetadata: {
              ...existingUser.publicMetadata,
              kiwifyOrderId: payload.order_id,
              productName: payload.Product.product_name,
              subscription: "active",
              type: "whitelabel",
              lastPurchase: new Date().toISOString(),
            },
          });

          console.log(`Updated existing user metadata: ${existingUser.id}`);

          // Dispara webhook externo para usuário existente
          await sendToExternalWebhook({
            id: existingUser.id,
            email: customer.email,
            name: fullName,
            kiwifyOrderId: payload.order_id,
            productName: payload.Product.product_name,
            subscription: "active",
            type: "whitelabel",
            isExisting: true,
          });

          return NextResponse.json({
            success: true,
            message: "User already exists, metadata updated",
            userId: existingUser.id,
            orderId: payload.order_id,
          });
        }
      }

      console.error("Error creating user in Clerk:", clerkError);
      throw clerkError;
    }
  } catch (error: any) {
    console.error("Webhook processing error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
