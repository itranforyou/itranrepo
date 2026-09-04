import nodemailer from 'nodemailer';

/**
 * Creates a Nodemailer transporter using environment variables.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false'; // default true for 465
  const user = process.env.SMTP_USER || process.env.EMAIL_TO || 'itranforyou06@gmail.com';
  const pass = process.env.SMTP_PASS;

  if (!pass) {
    console.warn('[Mail Helper] Warning: SMTP_PASS is not configured in environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

/**
 * Sends a Bulk Enquiry email notification to the destination email.
 * 
 * @param {Object} data Form data
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendBulkEnquiryEmail(data) {
  const recipientEmail = process.env.EMAIL_TO || 'itranforyou06@gmail.com';
  const senderEmail = process.env.SMTP_FROM || `"ITRĀN Website" <${process.env.SMTP_USER || 'itranforyou06@gmail.com'}>`;
  
  const {
    fullName = '',
    email = '',
    phone = '',
    city = '',
    occasion = 'Bulk Gifting',
    giftingType = '',
    eventDate = '',
    deliveryLocation = '',
    personalization = [],
    message = '',
    companyName = '',
    quantity = ''
  } = data;

  const personalizationStr = Array.isArray(personalization) && personalization.length > 0
    ? personalization.join(', ')
    : 'None selected';

  // Format Plain Text
  const plainText = `
BULK ENQUIRY – ITRĀN WEBSITE
--------------------------------------------------

Name:
${fullName}

Email:
${email}

Phone:
${phone}

City / Location:
${city || 'Not specified'}

Occasion / Category:
${occasion || giftingType || 'Bulk Gifting'}
${companyName ? `\nCompany:\n${companyName}` : ''}
${quantity ? `\nQuantity:\n${quantity}` : ''}
${eventDate ? `\nEvent Date:\n${eventDate}` : ''}
${deliveryLocation ? `\nDelivery / Venue Location:\n${deliveryLocation}` : ''}
${personalizationStr !== 'None selected' ? `\nPersonalisation & Branding:\n${personalizationStr}` : ''}

Customer Message / Vision:
${message || 'No additional message provided.'}

--------------------------------------------------
Submitted on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
`;

  // Format Luxury HTML Email
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f4ee; color: #222; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7ded4; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
    .header { background: #1c1e1c; color: #ffffff; padding: 28px 32px; text-align: center; }
    .brand { font-size: 11px; letter-spacing: 0.25em; color: #c19a5b; text-transform: uppercase; margin-bottom: 6px; font-weight: 600; }
    .title { font-size: 22px; font-family: Georgia, serif; letter-spacing: 0.05em; margin: 0; font-weight: normal; }
    .content { padding: 32px; }
    .badge { display: inline-block; background: #faf4eb; color: #8a6429; border: 1px solid #d4c8be; padding: 4px 12px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 2px; margin-bottom: 20px; font-weight: 600; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .table td { padding: 12px 14px; border-bottom: 1px solid #f0e9df; font-size: 14px; vertical-align: top; }
    .table td.label { width: 35%; color: #6d5a50; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.08em; }
    .table td.value { color: #1c1e1c; }
    .message-box { background: #faf7f2; border: 1px solid #ede4d8; padding: 16px; border-radius: 2px; font-size: 14px; line-height: 1.6; color: #333; margin-top: 8px; white-space: pre-wrap; }
    .footer { background: #fdfaf7; border-top: 1px solid #f0e9df; padding: 18px 32px; font-size: 12px; color: #8c7e75; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">ITRĀN BESPOKE GIFTING</div>
      <h1 class="title">New Bulk Enquiry Received</h1>
    </div>
    <div class="content">
      <div class="badge">${occasion || giftingType || 'Bulk Gifting'} Enquiry</div>
      <table class="table">
        <tr>
          <td class="label">Full Name</td>
          <td class="value"><strong>${fullName}</strong></td>
        </tr>
        <tr>
          <td class="label">Email Address</td>
          <td class="value"><a href="mailto:${email}" style="color: #8a6429; text-decoration: none;">${email}</a></td>
        </tr>
        <tr>
          <td class="label">Mobile Number</td>
          <td class="value"><a href="tel:${phone}" style="color: #8a6429; text-decoration: none;">${phone}</a></td>
        </tr>
        ${city ? `<tr><td class="label">City / Location</td><td class="value">${city}</td></tr>` : ''}
        ${companyName ? `<tr><td class="label">Company Name</td><td class="value">${companyName}</td></tr>` : ''}
        ${quantity ? `<tr><td class="label">Quantity</td><td class="value">${quantity}</td></tr>` : ''}
        ${eventDate ? `<tr><td class="label">Event Date</td><td class="value">${eventDate}</td></tr>` : ''}
        ${deliveryLocation ? `<tr><td class="label">Delivery Location</td><td class="value">${deliveryLocation}</td></tr>` : ''}
        ${personalizationStr !== 'None selected' ? `<tr><td class="label">Personalisation</td><td class="value">${personalizationStr}</td></tr>` : ''}
      </table>

      ${message ? `
        <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #6d5a50; margin-bottom: 6px;">
          Customer Notes / Vision
        </div>
        <div class="message-box">${message}</div>
      ` : ''}
    </div>
    <div class="footer">
      Submitted via iTran Website on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    </div>
  </div>
</body>
</html>
`;

  // Check if Resend API key is available as an alternative
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [recipientEmail],
          reply_to: email || undefined,
          subject: `New Bulk Enquiry – iTran Website (${fullName})`,
          text: plainText,
          html: htmlContent
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Resend API error');
      }

      const resData = await res.json();
      return { success: true, messageId: resData.id };
    } catch (err) {
      console.error('[Mail Helper] Resend API dispatch failed:', err);
      throw err;
    }
  }

  // Use Nodemailer SMTP Transport
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('SMTP credentials not configured. Please set SMTP_PASS in environment variables.');
  }

  const mailOptions = {
    from: senderEmail,
    to: recipientEmail,
    replyTo: email || undefined,
    subject: `New Bulk Enquiry – iTran Website (${fullName})`,
    text: plainText,
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
}
