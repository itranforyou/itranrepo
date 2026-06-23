import { NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";

// Robust price parser — handles 'Rs. 1,499', '₹1499', '$185', raw numbers, etc.
const parsePrice = (val) => {
  if (!val && val !== 0) return 0;
  if (typeof val === 'number') return val;
  const clean = val.toString()
    .replace(/Rs\.?/gi, '')
    .replace(/₹/g, '')
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .trim();
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

export async function POST(request) {
  try {
    const { amount, cart, customerDetails } = await request.json();

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty or invalid" }, { status: 400 });
    }

    if (!customerDetails || !customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      return NextResponse.json({ error: "Customer details are incomplete" }, { status: 400 });
    }

    // Verify amount matches server calculations to prevent client tampering
    const serverCalculatedSubtotal = cart.reduce((acc, item) => {
      const price = parsePrice(item.price);
      return acc + (price * (item.quantity || 1));
    }, 0);

    if (Math.abs(serverCalculatedSubtotal - amount) > 0.01) {
      return NextResponse.json({ error: "Amount mismatch detected" }, { status: 400 });
    }

    // Generate internal Order ID
    const generatedId = `SS-${Math.floor(10000 + Math.random() * 90000)}`;

    // Create Razorpay Order
    // Note: Razorpay expects amount in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(serverCalculatedSubtotal * 100),
      currency: "INR",
      receipt: generatedId,
    };

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create(options);

    const keyId = process.env.RAZORPAY_KEY_ID;

    return NextResponse.json({
      success: true,
      orderId: generatedId,
      razorpayOrderId: razorpayOrder.id,
      amount: serverCalculatedSubtotal,
      keyId: keyId, // Return key ID dynamically for Checkout modal initialization
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
