import { Resend } from "resend";

// TODO: Buyer must add their own Resend API key in .env
// 1. Sign up at https://resend.com (free: 100 emails/day)
// 2. Get API key from https://resend.com/api-keys
// 3. Verify your sending domain at https://resend.com/domains
// 4. Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env
const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "EventBook <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendBookingConfirmationEmail(params: {
  to: string;
  userName: string;
  bookingReference: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  totalAmount: number;
  currency: string;
}) {
  try {
    const { to, userName, bookingReference, eventTitle, eventDate, eventVenue, totalAmount, currency } = params;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Booking Confirmed — ${eventTitle} (${bookingReference})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af;">Booking Confirmed!</h1>
          <p>Hi ${userName},</p>
          <p>Your booking has been created. Complete your payment to secure your tickets.</p>

          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="margin-top: 0;">${eventTitle}</h2>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Venue:</strong> ${eventVenue}</p>
            <p><strong>Reference:</strong> ${bookingReference}</p>
            <p><strong>Total:</strong> ${currency} ${totalAmount.toFixed(2)}</p>
          </div>

          <a href="${APP_URL}/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            View My Bookings
          </a>

          <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
            This is an automated email from EventBook. If you did not make this booking, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`Booking confirmation email sent to ${to}`);
  } catch (error) {
    // Log but don't fail the booking if email fails
    console.error("Failed to send booking confirmation email:", error);
  }
}

export async function sendPaymentReceiptEmail(params: {
  to: string;
  userName: string;
  bookingReference: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  totalAmount: number;
  currency: string;
}) {
  try {
    const { to, userName, bookingReference, eventTitle, eventDate, eventVenue, totalAmount, currency } = params;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Payment Receipt — ${eventTitle} (${bookingReference})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #059669;">Payment Successful!</h1>
          <p>Hi ${userName},</p>
          <p>Your payment has been confirmed. Your tickets are secured!</p>

          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #065f46;">${eventTitle}</h2>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Venue:</strong> ${eventVenue}</p>
            <p><strong>Reference:</strong> ${bookingReference}</p>
            <p><strong>Amount Paid:</strong> ${currency} ${totalAmount.toFixed(2)}</p>
            <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">CONFIRMED</span></p>
          </div>

          <a href="${APP_URL}/dashboard" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            View My Tickets
          </a>

          <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
            This is an automated receipt from EventBook. Please keep this for your records.
          </p>
        </div>
      `,
    });

    console.log(`Payment receipt email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send payment receipt email:", error);
  }
}
