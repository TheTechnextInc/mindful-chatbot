# MindfulChat - Mental Health Support Chatbot

A modern Next.js application providing AI-powered mental health support with multiple therapeutic approaches, voice input/output, and emergency contact features.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Usage](#usage)
- [Emergency Features](#emergency-features)
- [Email Configuration](#email-configuration)

## Features

✅ **6 Therapeutic Modes**: Cognitive Behavioral Therapy, Mindfulness, Positive Psychology, Psychodynamic Therapy, Solution-Focused Therapy, Humanistic Therapy
✅ **Voice Input & Text-to-Speech**: Speak to the chatbot and hear AI responses
✅ **Emergency Contact System**: Set emergency contacts for alerts
✅ **SOS Button**: Send immediate alerts to emergency contacts
✅ **User Authentication**: Secure login/signup with Supabase
✅ **Dark Mode**: Full dark mode support
✅ **Progress Tracking**: Analytics and session history
✅ **Email Notifications**: Nodemailer with Ethereal Email for testing, Resend API for production

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Email**: Nodemailer with Ethereal Email, Resend API
- **AI**: Sonar API
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Sonar API key
- Resend API key (for production email sending)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/TheTechnextInc/mindful-chatbot.git
   cd mindful-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   Sonar_API_KEY=your_Sonar_key
   RESEND_API_KEY=your_resend_key
   EMAILJS_SERVICE_ID=service_egnr21q
   EMAILJS_TEMPLATE_ID=template_4kcj63e
   EMAILJS_PUBLIC_KEY=your_public_key_here
   EMAILJS_PRIVATE_KEY=your_private_key_here
   ```
   
   **Note**: Email functionality uses EmailJS for sending emergency alerts and progress notifications. No additional email service API key required for testing.

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  emergency_email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  therapy_mode TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL (user, assistant),
  content TEXT NOT NULL,
  therapy_mode TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### User Analytics Table
```sql
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_id UUID REFERENCES chat_sessions(id),
  therapy_mode TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Emergency Notifications Table
```sql
CREATE TABLE emergency_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  emergency_email TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account with emergency contact.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "fullName": "John Doe",
  "emergencyEmail": "emergency@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "userId": "uuid"
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "session": "session_data"
}
```

### Chat

#### POST /api/chat
Send a message and get AI response based on therapy mode.

**Request Body:**
```json
{
  "message": "I'm feeling anxious",
  "sessionId": "uuid",
  "therapyMode": "cbt"
}
```

**Response:**
```json
{
  "response": "AI response text",
  "therapyMode": "cbt",
  "sessionId": "uuid"
}
```

**Therapy Modes:**
- `cbt` - Cognitive Behavioral Therapy
- `mindfulness` - Mindfulness-Based Therapy
- `positive` - Positive Psychology
- `psychodynamic` - Psychodynamic Therapy
- `solution` - Solution-Focused Therapy
- `humanistic` - Humanistic Therapy

### Emergency

#### POST /api/emergency/send-alert
Send immediate SOS alert to emergency contact.

**Request Body:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Emergency alert sent to your emergency contact",
  "previewUrl": "https://ethereal.email/message/xxx"
}
```

**Note**: The `previewUrl` allows you to view the sent email in Ethereal's web interface. This is useful for testing and debugging email content.

#### POST /api/auth/send-progress-email
Send progress report to emergency contact.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "notificationType": "milestone",
  "progressData": {
    "sessionsCompleted": 10,
    "therapyMode": "CBT",
    "progressPercentage": 75
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progress notification sent",
  "email": "emergency@example.com",
  "type": "milestone",
  "previewUrl": "https://ethereal.email/message/xxx"
}
```

**Notification Types:**
- `milestone` - Celebrate significant progress achievements
- `weekly_progress` - Weekly summary of therapy sessions
- `concern_alert` - Alert for mental wellness concerns requiring attention

## Therapeutic Modes

### 1. Cognitive Behavioral Therapy (CBT)
Focus on identifying and changing negative thought patterns.

### 2. Mindfulness
Emphasis on present-moment awareness and acceptance.

### 3. Positive Psychology
Build on strengths and foster gratitude.

### 4. Psychodynamic Therapy
Explore underlying emotions and past experiences.

### 5. Solution-Focused Therapy
Practical, goal-oriented approach.

### 6. Humanistic Therapy
Empathetic, person-centered support.

## Voice Features

### Voice Input
- Click the microphone icon in the chat
- Speak your message
- Automatically transcribed and sent

### Text-to-Speech
- AI responses are automatically spoken
- Click speaker icon to replay
- Adjustable speed and volume in settings

## Emergency Contact Management

### During Signup
Set emergency contact email during account creation.

### Update in Settings
1. Go to Settings page
2. Scroll to Emergency Contact section
3. Enter valid email address
4. Click "Update Emergency Contact"
5. Email is saved to profile

### Using SOS Button
1. Click SOS button in header
2. Confirm emergency alert
3. Immediate alert sent to emergency contact
4. Alert includes crisis resources and user information

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to vercel.com
   - Import your GitHub repository
   - Add environment variables in settings

3. **Deploy**
   ```bash
   vercel deploy --prod
   ```

## Crisis Resources

🇺🇸 **National Suicide Prevention Lifeline**: 988
🇬🇧 **Crisis Text Line**: Text HOME to 741741
🌍 **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

## Project Structure

```
mental-health-chatbot/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.ts
│   │   │   └── login/route.ts
│   │   ├── chat/route.ts
│   │   ├── emergency/
│   │   │   └── send-alert/route.ts
│   │   └── auth/
│   │       └── send-progress-email/route.ts
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/page.tsx
│   ├── settings/page.tsx
│   ├── help/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat-interface.tsx
│   ├── dashboard-content.tsx
│   ├── header.tsx
│   ├── therapy-mode-selector.tsx
│   ├── welcome-screen.tsx
│   └── ui/
├── lib/
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── scripts/
│   ├── 001_create_users_and_analytics.sql
│   └── 004_add_emergency_email_to_profiles.sql
└── README.md
```

## 📧 Email Configuration

### EmailJS (Current Implementation)

The application uses **EmailJS** for sending emergency alerts and progress notifications. EmailJS is a reliable service that works seamlessly in both development and production.

#### Required Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

```env
EMAILJS_SERVICE_ID=service_egnr21q
EMAILJS_TEMPLATE_ID=template_4kcj63e
EMAILJS_PUBLIC_KEY=your_public_key_here
EMAILJS_PRIVATE_KEY=your_private_key_here
```

Get these from your EmailJS dashboard at https://emailjs.com/admin

#### ⚠️ CRITICAL: EmailJS Template Configuration for HTML Emails

**Problem:** Emails showing raw HTML code instead of formatted content?

**Solution:** Your EmailJS template must use **triple curly braces** for the message body.

**Step-by-Step Template Setup:**

1. Go to https://emailjs.com/admin/templates
2. Open or create template `template_4kcj63e`
3. Configure these fields:

**To Email:**
```
{{to_email}}
```

**Subject:**
```
{{subject}}
```

**Body (CRITICAL - Use Triple Braces):**
```html
{{{message}}}
```

#### Why Triple Braces Matter

| Syntax | Result | Use Case |
|--------|--------|----------|
| `{{message}}` | Shows raw HTML: `<div>Hello</div>` | Plain text only |
| `{{{message}}}` | Renders HTML: **Formatted content** | HTML emails ✅ |

**Double braces (`{{}}`)** escape HTML → You see raw code
**Triple braces (`{{{}}}`)** render HTML → You see formatted email

#### Template Variables Reference

Your EmailJS template receives these variables from the app:

| Variable | Description | Example |
|----------|-------------|---------|
| `to_email` | Recipient's email | `emergency@example.com` |
| `to_name` | Recipient's name | `emergency` |
| `from_name` | Sender's name | `MindfulChat Alert` |
| `subject` | Email subject line | `🚨 Emergency Alert` |
| `message` | **HTML body (use `{{{message}}}`)** | Full HTML email |
| `html_content` | Alternative HTML field | Same as message |
| `email_subject` | Alternative subject field | Same as subject |

#### Example Complete EmailJS Template

```
Email Settings:
- To: {{to_email}}
- From Name: {{from_name}}
- Subject: {{subject}}

Template Body:
{{{message}}}
```

#### Common Issues & Solutions

**Issue:** Receiving raw HTML code in email
```html
<div style="font-family: Arial...">
  <div style="background-color: #dc2626...">
```

**Fix:** Change template body from `{{message}}` to `{{{message}}}`

---

**Issue:** "The recipients address is empty"

**Fix:** Set template's To Email field to `{{to_email}}`

---

**Issue:** Email not sending at all

**Fix:** Verify all 4 environment variables are set in Vercel:
- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID`
- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_PRIVATE_KEY`

---

**Issue:** "API calls are disabled for non-browser applications"

**Fix:** Make sure you're using `accessToken` (private key) for server-side calls. The app already handles this correctly.

#### Email Files in Codebase

- `lib/email-sender.ts` - EmailJS integration and sending logic
- `app/api/emergency/send-alert/route.ts` - Emergency SOS emails
- `app/api/auth/send-progress-email/route.ts` - Progress notifications

#### Alternative Email Services

If you prefer a different service, you can easily switch:

**Resend (Recommended for production):**
```javascript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
await resend.emails.send({
  from: 'alerts@yourdomain.com',
  to: emergencyEmail,
  subject: 'Alert',
  html: emailHtml
})
```

**SendGrid:**
```javascript
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
await sgMail.send({ from, to, subject, html })
```

**Nodemailer (requires custom SMTP):**
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user, pass }
})
await transporter.sendMail({ from, to, subject, html })
```

##Project URL

🔗 https://mentalhealth-bot.vercel.app/dashboard

## License

MIT License - See LICENSE file for details.
