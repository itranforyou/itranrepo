import Razorpay from "razorpay";

/**
 * Lazy-loads the Razorpay instance.
 * Next.js statically analyzes routes during build time. If Razorpay is
 * instantiated at the module level, the build will fail on Vercel
 * if RAZORPAY_KEY_ID is missing from the environment.
 */
let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not defined in the server environment variables.");
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayInstance;
};
