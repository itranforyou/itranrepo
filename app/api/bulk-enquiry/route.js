import { NextResponse } from 'next/server';
import { sendBulkEnquiryEmail } from '@/lib/mail';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      city,
      occasion,
      giftingType,
      eventDate,
      deliveryLocation,
      personalization,
      message,
      companyName,
      quantity,
      userId,
      honeypot
    } = body;

    // 1. Anti-spam honeypot check
    if (honeypot) {
      console.warn('[Bulk Enquiry API] Spam bot detected via honeypot field.');
      return NextResponse.json({ success: true, message: 'Enquiry submitted.' }, { status: 200 });
    }

    // 2. Server-side validation
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Full name is required.' }, { status: 400 });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return NextResponse.json({ success: false, error: 'A valid mobile phone number is required.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!city || typeof city !== 'string' || !city.trim()) {
      return NextResponse.json({ success: false, error: 'City / location is required.' }, { status: 400 });
    }

    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      occasion: occasion || 'Bulk Gifting',
      giftingType: giftingType || 'bespoke',
      eventDate: eventDate ? String(eventDate).trim() : '',
      deliveryLocation: deliveryLocation ? String(deliveryLocation).trim() : '',
      personalization: Array.isArray(personalization) ? personalization : [],
      message: message ? String(message).trim() : '',
      companyName: companyName ? String(companyName).trim() : '',
      quantity: quantity ? String(quantity).trim() : '',
      userId: userId || null
    };

    // 3. Dispatch Email
    try {
      await sendBulkEnquiryEmail(payload);
    } catch (mailError) {
      console.error('[Bulk Enquiry API] Error dispatching email to itranforyou06@gmail.com:', mailError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unable to submit your enquiry right now. Please try again or contact us directly.' 
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you! Your enquiry has been submitted successfully. Our team will contact you shortly.' 
    }, { status: 200 });

  } catch (error) {
    console.error('[Bulk Enquiry API] Internal server error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unable to submit your enquiry right now. Please try again or contact us directly.' 
      }, 
      { status: 500 }
    );
  }
}
