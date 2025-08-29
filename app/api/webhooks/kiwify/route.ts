import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

import crypto from "crypto";

interface KiwifyWebhookPayload {
  url: string;
  signature: string;
  order: {
    order_id: string;
    order_status: string;
    Product: {
      product_name: string;
    };
    Customer: {
      full_name: string;
      first_name: string;
      email: string;
      mobile: string;
      CPF: string;
    };
  };
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
  console.log("oi");
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
    endpoint: "/api/webhooks/kiwify",
  });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("X-Kiwify-Signature") || "";

    const payload: KiwifyWebhookPayload = JSON.parse(rawBody);

    console.log("Kiwify webhook received:", {
      orderId: payload.order.order_id,
      status: payload.order.order_status,
      customerEmail: payload.order.Customer.email,
      productName: payload.order.Product.product_name,
    });

    if (payload.order.order_status !== "paid") {
      console.log(
        `Order ${payload.order.order_id} not paid, skipping account creation`
      );
      return NextResponse.json({ message: "Order not paid, skipping" });
    }

    const { Customer: customer } = payload.order;
    const fullName = customer.full_name || `${customer.first_name}`.trim();
    const clerk = (await clerkClient()).users;

    // Sempre tenta buscar usuário existente primeiro
    const existingUsers = await clerk.getUserList({
      emailAddress: [customer.email],
    });

    if (existingUsers.data.length > 0) {
      // Usuário existe - atualizar
      const existingUser = existingUsers.data[0];

      await clerk.updateUserMetadata(existingUser.id, {
        publicMetadata: {
          ...existingUser.publicMetadata,
          kiwifyOrderId: payload.order.order_id,
          productName: payload.order.Product.product_name,
          subscription: "active",
          type: "whitelabel",
          lastPurchase: new Date().toISOString(),
        },
        privateMetadata: {
          ...existingUser.privateMetadata,
          cpf: customer.CPF,
          mobile: customer.mobile,
        },
      });

      console.log(
        `Updated existing user: ${existingUser.id} for email: ${customer.email}`
      );

      // Dispara webhook externo para usuário existente
      await sendToExternalWebhook({
        id: existingUser.id,
        email: customer.email,
        name: fullName,
        kiwifyOrderId: payload.order.order_id,
        productName: payload.order.Product.product_name,
        subscription: "active",
        type: "whitelabel",
        isExisting: true,
      });

      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        userId: existingUser.id,
        orderId: payload.order.order_id,
      });
    } else {
      // Usuário não existe - criar
      console.log("Creating new user with data:", {
        email: customer.email,
        firstName: customer.first_name,
        cpf: customer.CPF,
        mobile: customer.mobile,
      });

      try {
        const user = await clerk.createUser({
          emailAddress: [customer.email],
          firstName: customer.first_name,
          password: crypto.randomBytes(16).toString('hex'), // Senha temporária aleatória
          publicMetadata: {
            kiwifyOrderId: payload.order.order_id,
            productName: payload.order.Product.product_name,
            subscription: "active",
            type: "whitelabel",
            createdFromWebhook: true,
          },
          privateMetadata: {
            cpf: customer.CPF,
            mobile: customer.mobile,
          },
        });

        console.log(`User created: ${user.id} for email: ${customer.email}`);

        // Dispara webhook externo para usuário criado
        await sendToExternalWebhook({
          id: user.id,
          email: customer.email,
          name: fullName,
          kiwifyOrderId: payload.order.order_id,
          productName: payload.order.Product.product_name,
          subscription: "active",
          type: "whitelabel",
        });

        return NextResponse.json({
          success: true,
          message: "User created successfully",
          userId: user.id,
          orderId: payload.order.order_id,
        });
      } catch (clerkError: any) {
        console.error("Detailed Clerk error:", {
          message: clerkError.message,
          status: clerkError.status,
          errors: clerkError.errors,
          clerkTraceId: clerkError.clerkTraceId,
        });

        // Se o usuário já existe, tenta buscar e atualizar
        if (clerkError.errors?.[0]?.code === "form_identifier_exists") {
          console.log("User exists after all, trying to update...");
          const existingUsers = await clerk.getUserList({
            emailAddress: [customer.email],
          });

          if (existingUsers.data.length > 0) {
            const existingUser = existingUsers.data[0];

            await clerk.updateUserMetadata(existingUser.id, {
              publicMetadata: {
                ...existingUser.publicMetadata,
                kiwifyOrderId: payload.order.order_id,
                productName: payload.order.Product.product_name,
                subscription: "active",
                type: "whitelabel",
                lastPurchase: new Date().toISOString(),
              },
              privateMetadata: {
                ...existingUser.privateMetadata,
                cpf: customer.CPF,
                mobile: customer.mobile,
              },
            });

            await sendToExternalWebhook({
              id: existingUser.id,
              email: customer.email,
              name: fullName,
              kiwifyOrderId: payload.order.order_id,
              productName: payload.order.Product.product_name,
              subscription: "active",
              type: "whitelabel",
              isExisting: true,
            });

            return NextResponse.json({
              success: true,
              message: "User updated successfully (fallback)",
              userId: existingUser.id,
              orderId: payload.order.order_id,
            });
          }
        }

        throw clerkError;
      }
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
