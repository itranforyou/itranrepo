import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminServices } from "@/lib/firebaseAdmin";
import { getRazorpayInstance } from "@/lib/razorpay";

export async function POST(request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      userId,
      customerDetails,
      orderedProducts,
      totalAmount
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: "Missing required payment details" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error("Razorpay secret key is not configured in environment variables.");
      return NextResponse.json({ error: "Razorpay is not configured on server" }, { status: 500 });
    }

    // 1. Verify Razorpay Signature securely on backend
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("Invalid signature detected:", {
        generated: generatedSignature,
        received: razorpay_signature
      });
      return NextResponse.json({ error: "Payment verification signature mismatch" }, { status: 400 });
    }

    // 2. Fetch order details from Razorpay to verify the amount paid matches
    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    const expectedAmountPaise = Math.round(totalAmount * 100);

    if (razorpayOrder.amount !== expectedAmountPaise) {
      console.error("Amount mismatch:", {
        razorpayAmount: razorpayOrder.amount,
        expectedAmountPaise
      });
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }

    // 3. Create/confirm the order in Firestore
    const orderData = {
      orderId: orderId,
      userId: userId || null,
      customerDetails: customerDetails,
      orderedProducts: orderedProducts.map(item => ({
        id: item.id || null,
        name: item.name || '',
        price: item.price || '',
        quantity: item.quantity || 1,
        category: item.category || '',
        image: item.image || item.images?.[0] || '',
        giftOptions: item.giftOptions || null
      })),
      totalAmount: totalAmount,
      paymentMethod: "Razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      utrNumber: razorpay_payment_id, // duplicate for existing tracking and admin search compatibility
      orderDate: new Date().toISOString(),
      orderStatus: "Processing",
      paymentStatus: "Paid"
    };

    // Store order in Firestore using Admin SDK
    const { adminDb } = await getAdminServices();
    await adminDb.collection("orders").doc(orderId).set(orderData);

    return NextResponse.json({
      success: true,
      orderId: orderId,
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error("Payment verification and order storage failed:", error);
    return NextResponse.json({ error: error.message || "Internal verification error" }, { status: 500 });
  }
}
