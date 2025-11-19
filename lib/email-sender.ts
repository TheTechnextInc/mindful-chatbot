export async function sendEmail({
  to,
  from = 'MindfulChat <noreply@mindfulchat.com>',
  subject,
  html,
}: {
  to: string
  from?: string
  subject: string
  html: string
}) {
  console.log('[v0] Email Details:')
  console.log('[v0] From:', from)
  console.log('[v0] To:', to)
  console.log('[v0] Subject:', subject)
  
  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_w48em0a'
    const templateId = process.env.EMAILJS_TEMPLATE_ID
    const publicKey = process.env.EMAILJS_PUBLIC_KEY
    const privateKey = process.env.EMAILJS_PRIVATE_KEY

    if (!templateId || !publicKey || !privateKey) {
      console.error('[v0] ⚠️  EmailJS not configured. Missing environment variables.')
      console.log('[v0] 📧 Email Content (not sent):')
      console.log('[v0] Subject:', subject)
      console.log('[v0] To:', to)
      console.log('[v0] HTML:', html.substring(0, 200) + '...')
      
      return {
        success: false,
        mode: 'error',
        error: 'EmailJS not configured. Please add EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, and EMAILJS_PRIVATE_KEY environment variables.',
        emailContent: { from, to, subject, html }
      }
    }

    console.log('[v0] Sending email via EmailJS...')
    console.log('[v0] Service ID:', serviceId)
    console.log('[v0] Template ID:', templateId)

    // EmailJS templates use {{to_name}}, {{to_email}}, {{from_name}}, {{message}}, etc.
    const emailJsUrl = 'https://api.emailjs.com/api/v1.0/email/send'
    
    const response = await fetch(emailJsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          to_email: to,
          to_name: to.split('@')[0], // Extract name from email
          from_name: from.split('<')[0].trim(),
          subject: subject,
          message: html,
          html_content: html, // Alternative field name
          email_subject: subject, // Alternative field name
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] EmailJS API Error:', errorText)
      
      // Fallback: Log email to console
      console.log('[v0] 📧 Email Content (not sent):')
      console.log('[v0] Subject:', subject)
      console.log('[v0] To:', to)
      console.log('[v0] HTML:', html.substring(0, 200) + '...')
      console.log('[v0] ⚠️  Please check your EmailJS template configuration.')
      console.log('[v0] ⚠️  Make sure your template includes {{to_email}} or update the template_params.')
      
      return {
        success: false,
        mode: 'error',
        error: `EmailJS error: ${errorText}`,
        emailContent: { from, to, subject, html }
      }
    }

    const result = await response.text()
    console.log('[v0] ✅ Email sent successfully via EmailJS!')
    console.log('[v0] Response:', result)

    return { 
      success: true, 
      emailId: result,
      mode: 'emailjs'
    }
  } catch (error) {
    console.error('[v0] ⚠️  Email sending failed:', error)
    console.log('[v0] 📧 Email content (logged only):')
    console.log('[v0] Subject:', subject)
    console.log('[v0] To:', to)
    console.log('[v0] HTML:', html.substring(0, 200) + '...')
    
    return { 
      success: false,
      mode: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      emailContent: { from, to, subject, html }
    }
  }
}
