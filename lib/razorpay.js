import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn("WARNING: Razorpay credentials are not defined in the server environment variables.");
}

export const razorpay = new Razorpay({
  key_id: keyId || "",
  key_secret: keySecret || "",
});

export default razorpay;
