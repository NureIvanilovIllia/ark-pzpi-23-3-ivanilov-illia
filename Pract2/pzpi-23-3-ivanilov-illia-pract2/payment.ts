import crypto from "crypto";

const publicKey = "sandbox_123";
const privateKey = "sandbox_123";

export interface PaymentData {
    public_key: string;
    version: string;
    action: string;
    amount: string;
    currency: string;
    description: string;
    order_id: string;
    sandbox: string;
}

export function generateOrderId(membershipId?: number): string {
    if (membershipId) {
        return `order_${membershipId}_${Date.now()}`;
    }
    return "order_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
}

export function createSignature(data: PaymentData) {
    const json = JSON.stringify(data);
    const base64 = Buffer.from(json).toString("base64");
    const signature = crypto
        .createHash("sha1")
        .update(privateKey + base64 + privateKey)
        .digest("base64");
    return { data: base64, signature };
}

export function createPaymentData(
    amount: string,
    description: string,
    membershipId?: number
): PaymentData {
    return {
        public_key: publicKey,
        version: "3",
        action: "pay",
        amount: amount,
        currency: "USD",
        description: description,
        order_id: generateOrderId(membershipId),
        sandbox: "1",
    };
}

export function getPaymentDataWithSignature(
    amount: string,
    description: string,
    membershipId?: number
) {
    const paymentData = createPaymentData(amount, description, membershipId);
    return createSignature(paymentData);
}

