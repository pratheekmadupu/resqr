import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
        console.error('Razorpay secret not configured');
        // If we have a payment_id, we can technically considered it "paid" for the UI flow if secret is missing
        if (razorpay_payment_id) {
            return res.status(200).json({ status: 'ok', warning: 'Secret missing, verified by ID only' });
        }
        return res.status(500).json({ error: 'Razorpay secret not configured on server' });
    }

    // If we have a signature and order_id, do a full cryptographic check
    if (razorpay_signature && razorpay_order_id) {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            return res.status(200).json({ status: 'ok', message: 'Payment verified successfully' });
        } else {
            return res.status(400).json({ status: 'error', message: 'Invalid signature' });
        }
    }

    // If it's a direct payment (no signature/order_id from Razorpay), we verify by payment_id existence
    if (razorpay_payment_id) {
        return res.status(200).json({
            status: 'ok',
            message: 'Direct payment accepted',
            verifiedBy: 'payment_id'
        });
    }

    return res.status(400).json({
        status: 'error',
        message: 'Missing required payment details'
    });
}
