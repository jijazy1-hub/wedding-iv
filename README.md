# 💍 Wedding RSVP App — Joseph & Ada

A production-ready wedding RSVP system built with Next.js 14, Airtable, Tailwind CSS, and pdf-lib. Guests verify their invitation via phone number, submit their RSVP, and download a beautifully designed PDF admission card with a QR code.

---

## 📁 Folder Structure

```
wedding-rsvp/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── check-guest/route.ts   # Phone verification endpoint
│   │   │   ├── rsvp/route.ts          # RSVP submission endpoint
│   │   │   └── generate-card/route.ts # PDF generation endpoint
│   │   ├── globals.css                # Global styles + animations
│   │   ├── layout.tsx                 # Root layout with fonts
│   │   └── page.tsx                   # Main RSVP page (all stages)
│   ├── components/
│   │   ├── Petals.tsx                 # Animated falling petal background
│   │   └── Spinner.tsx                # Loading spinner
│   └── lib/
│       ├── airtable.ts                # Airtable client + helpers
│       └── pdf.ts                     # PDF card generation
├── public/
├── .env.local.example                 # Environment variable template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

---

## 🗃️ Step 1: Airtable Setup

### 1.1 Create a Free Airtable Account
Go to [airtable.com](https://airtable.com) and sign up.

### 1.2 Create a New Base
- Click **"Add a base"** → **"Start from scratch"**
- Name it: `Wedding RSVP` (or anything you like)

### 1.3 Create the "Guests" Table
Rename the default table to **`Guests`** and add these fields **exactly**:

| Field Name    | Field Type       | Notes                                      |
|---------------|------------------|--------------------------------------------|
| `Name`        | Single line text | Guest's full name                          |
| `Phone`       | Single line text | Store as `08012345678` (normalized format) |
| `Email`       | Email            | Will be filled on RSVP submission          |
| `Invited`     | Checkbox         | ✅ Check for all invited guests             |
| `RSVP_Status` | Single select    | Options: `Pending`, `Confirmed`, `Declined`|
| `Attendance`  | Single select    | Options: `Yes`, `No`                       |
| `Seat_Number` | Number           | Auto-assigned on confirmation              |
| `Unique_Code` | Single line text | Auto-generated (e.g. `WED-AB1-2CD`)        |

> ⚠️ Field names are **case-sensitive**. Use exactly the names above.

### 1.4 Add Your Guest List
Add rows for each guest. Fill in:
- **Name** — full name
- **Phone** — their phone number (e.g. `08012345678`)
- **Invited** — check the box ✅
- **RSVP_Status** — set to `Pending`
- Leave Email, Attendance, Seat_Number, Unique_Code blank (filled automatically)

### 1.5 Get Your Airtable Credentials

**Personal Access Token:**
1. Go to [airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Click **"Create new token"**
3. Name: `wedding-rsvp`
4. Scopes: Add `data.records:read` and `data.records:write`
5. Access: Select your `Wedding RSVP` base
6. Copy the token → this is your `AIRTABLE_API_KEY`

**Base ID:**
1. Open your base in Airtable
2. Look at the URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. Copy `appXXXXXXXXXXXXXX` → this is your `AIRTABLE_BASE_ID`

---

## ⚙️ Step 2: Local Development

### 2.1 Prerequisites
- Node.js 18+ installed ([nodejs.org](https://nodejs.org))
- npm or yarn

### 2.2 Clone / Download the Project
```bash
# If using git
git clone <your-repo-url>
cd wedding-rsvp

# Or just navigate to the project folder
cd wedding-rsvp
```

### 2.3 Install Dependencies
```bash
npm install
```

### 2.4 Configure Environment Variables
```bash
# Copy the example file
cp .env.local.example .env.local
```

Open `.env.local` and fill in your values:
```env
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=Guests

NEXT_PUBLIC_WEDDING_TITLE=Joseph & Ada
NEXT_PUBLIC_WEDDING_DATE=Saturday, 14th December 2024
NEXT_PUBLIC_WEDDING_VENUE=The Grand Ballroom, Eko Hotel & Suites, Victoria Island, Lagos
NEXT_PUBLIC_WEDDING_TIME=12:00 PM
```

### 2.5 Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2.6 Test the Flow
1. Enter a phone number that exists in your Airtable Guests table
2. Verify the name auto-fills correctly
3. Fill in email and select attendance
4. If "Yes" → check that Airtable updates and the PDF downloads
5. If "No" → check that RSVP_Status = Declined in Airtable

---

## 🚀 Step 3: Deploy to Vercel

### 3.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Wedding RSVP app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wedding-rsvp.git
git push -u origin main
```

### 3.2 Import to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in (use GitHub login)
2. Click **"Add New Project"**
3. Select your `wedding-rsvp` repository
4. Framework: **Next.js** (auto-detected)
5. Click **"Deploy"** — but first, add environment variables ⬇️

### 3.3 Add Environment Variables in Vercel
Before deploying, scroll to **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `AIRTABLE_API_KEY` | Your Personal Access Token |
| `AIRTABLE_BASE_ID` | Your Base ID (`appXXXX...`) |
| `AIRTABLE_TABLE_NAME` | `Guests` |
| `NEXT_PUBLIC_WEDDING_TITLE` | `Joseph & Ada` |
| `NEXT_PUBLIC_WEDDING_DATE` | `Saturday, 14th December 2024` |
| `NEXT_PUBLIC_WEDDING_VENUE` | Your venue |
| `NEXT_PUBLIC_WEDDING_TIME` | `12:00 PM` |

### 3.4 Deploy
Click **"Deploy"**. In ~2 minutes your app will be live at:
`https://wedding-rsvp-XXXX.vercel.app`

### 3.5 Custom Domain (Optional)
1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain (e.g. `rsvp.josephandada.com`)
3. Follow DNS instructions from Vercel

---

## 🔁 Application Flow

```
User visits site
      │
      ▼
Enters phone number
      │
      ▼
API: /api/check-guest
      │
   ┌──┴──┐
Not found  Found & Invited
   │           │
Show error   Show RSVP form
             (name auto-filled)
                  │
             User submits
                  │
          ┌───────┴───────┐
         No              Yes
          │               │
   Update Airtable   Generate seat + code
   Status=Declined   Update Airtable
          │          Status=Confirmed
   "Sorry you            │
   can't make it"   Show success card
                         │
                   Download PDF card
                   (with QR code)
```

---

## 🎨 Customizing the App

### Change Wedding Details
Edit your `.env.local` (locally) or Vercel environment variables:
```env
NEXT_PUBLIC_WEDDING_TITLE=Emmanuel & Chioma
NEXT_PUBLIC_WEDDING_DATE=Friday, 21st March 2025
NEXT_PUBLIC_WEDDING_VENUE=Civic Centre, Ozumba Mbadiwe, Victoria Island, Lagos
NEXT_PUBLIC_WEDDING_TIME=2:00 PM
```

### Change Colors
Edit `tailwind.config.js` — modify the `champagne` and `blush` color scales.

### Change Fonts
Edit `src/app/layout.tsx` — swap the Google Font imports.

### Customize PDF Card
Edit `src/lib/pdf.ts` — all layout, colors, and text are fully customizable.

---

## 🛡️ API Reference

### `POST /api/check-guest`
Verifies if a guest is invited.

**Request:**
```json
{ "phone": "08012345678" }
```

**Response (found):**
```json
{
  "found": true,
  "guest": {
    "id": "recXXXX",
    "name": "Ada Okafor",
    "rsvpStatus": "Pending",
    "attendance": null,
    "seatNumber": null,
    "uniqueCode": null
  }
}
```

**Response (not found):**
```json
{ "found": false, "message": "You are not on our guest list." }
```

---

### `POST /api/rsvp`
Submits RSVP and updates Airtable.

**Request:**
```json
{
  "phone": "08012345678",
  "email": "ada@example.com",
  "attendance": "Yes"
}
```

**Response (confirmed):**
```json
{
  "success": true,
  "attendance": "Yes",
  "guestName": "Ada Okafor",
  "seatNumber": 7,
  "uniqueCode": "WED-AB1-2CD"
}
```

---

### `POST /api/generate-card`
Generates a PDF RSVP card. Returns binary PDF data.

**Request:**
```json
{
  "guestName": "Ada Okafor",
  "uniqueCode": "WED-AB1-2CD",
  "seatNumber": 7
}
```

**Response:** `application/pdf` binary stream

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "You are not on our guest list" even for valid guests | Check phone format in Airtable — store as `08012345678` |
| PDF fails to generate | Ensure `NEXT_PUBLIC_*` env vars are set in Vercel |
| Airtable 403 error | Regenerate your Personal Access Token with correct scopes |
| Fields not updating | Check field names in Airtable match exactly (case-sensitive) |
| QR code not in PDF | Ensure `qrcode` package is installed: `npm install qrcode` |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + Custom CSS animations |
| Backend | Next.js API Routes (serverless) |
| Database | Airtable (via REST API) |
| PDF | pdf-lib (server-side) |
| QR Code | qrcode (server-side) |
| Fonts | Cormorant Garamond + EB Garamond (Google Fonts) |
| Hosting | Vercel |

---

## 📝 License

Built for personal use. Customize freely for your wedding! 💍
