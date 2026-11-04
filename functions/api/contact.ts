import { json, type PagesContext } from '../_shared';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const onRequestPost = async ({ request, env }: PagesContext) => {
  const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const rateData = rateLimitMap.get(clientIp);
  if (rateData && now < rateData.resetTime) {
    if (rateData.count >= 5) return json({ error: 'Too many contact requests from this IP. Please try again in 15 minutes.' }, 429);
    rateData.count += 1;
  } else rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ error: 'Invalid request body.' }, 400); }
  const { name, email, company, serviceType, budget, timeline, message, additionalInfo, honeypot } = body;
  if (honeypot) return json({ success: true, message: 'Message sent successfully.' });
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) return json({ error: 'Please provide a valid name between 2 and 100 characters.' }, 400);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== 'string' || !emailRegex.test(email.trim()) || email.length > 150) return json({ error: 'Please provide a valid email address.' }, 400);
  if (typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 2000) return json({ error: 'Please enter a message between 10 and 2000 characters.' }, 400);
  if (!env.RESEND_API_KEY || !env.CONTACT_EMAIL) return json({ error: 'Unable to deliver message at this time. Please try again later or contact me directly.' }, 500);
  const text = (value: unknown, fallback: string, max: number) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
  const lead = {
    name: name.trim().slice(0, 100), email: email.trim().slice(0, 150), company: text(company, 'N/A', 150),
    serviceType: text(serviceType, 'General Inquiry', 100), budget: text(budget, 'Flexible', 100), timeline: text(timeline, 'Flexible', 100),
    message: message.trim().slice(0, 2000), additionalInfo: text(additionalInfo, 'None provided', 1000),
  };
  const emailBodyText = `NEW PROJECT INQUIRY\n\nName: ${lead.name}\nEmail: ${lead.email}\nCompany: ${lead.company}\nProject type: ${lead.serviceType}\nBudget: ${lead.budget}\nTimeline: ${lead.timeline}\n\nProject description:\n${lead.message}\n\nAdditional information:\n${lead.additionalInfo}`;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Portfolio Inquiries <onboarding@resend.dev>', to: [env.CONTACT_EMAIL], reply_to: lead.email, subject: `NEW PROJECT INQUIRY: ${lead.serviceType} from ${lead.name}`, text: emailBodyText }),
    });
    if (!response.ok) return json({ error: 'Unable to deliver message at this time. Please try again later or contact me directly.' }, 500);
  } catch { return json({ error: 'Unable to deliver message at this time. Please try again later or contact me directly.' }, 500); }
  return json({ success: true, message: `Thank you ${lead.name}. Your message has been sent successfully! Ariti will reply to ${lead.email} within 24 hours.`, referenceId: `lead_${Date.now()}` });
};
