# 📋 Lead Storage Setup Guide (Google Sheets)

This guide connects your website's **Book Free Consultation** and **Apply Now / Enroll Now**
forms to a **Google Sheet**, so every submission is saved automatically.

- No coding needed — just copy & paste.
- One spreadsheet, two tabs: **Consultations** and **Applications**.
- One-time setup: about **5 minutes**.

When someone submits a form, they see a success message ("our team will contact you shortly").
**Nothing is sent to WhatsApp automatically** — your team reaches out manually using the
contact details captured in the sheet.

---

## ✅ What gets stored

**Tab 1 — "Consultations"** (Book Free Consultation form)
| Date & Time | Full Name | Phone | Email | Background | Source |
|---|---|---|---|---|---|

**Tab 2 — "Applications"** (Apply Now / Enroll Now form)
| Date & Time | Full Name | Phone | Email | Qualification | Current Status | City | Source |
|---|---|---|---|---|---|---|---|

Both tabs (and their header rows) are created **automatically** on the first submission.

---

## STEP 1 — Connect your Google account & create the sheet

1. Open your web browser and **sign in to the Google account** where you want the leads to live
   (this is "connecting your Google account" — there's nothing else to install).
2. Go to **https://sheets.new** — a new blank spreadsheet opens.
3. Click the name in the **top-left** (it says "Untitled spreadsheet") and rename it to
   **`BA Academy Leads`**.
   > Don't worry about creating tabs — the script makes "Consultations" and "Applications" for you.

---

## STEP 2 — Add the lead-capture script (the only configuration)

1. In that spreadsheet's top menu, click **Extensions ▸ Apps Script**.
   A new tab opens with a code editor.
2. Delete whatever sample code is shown (e.g. `function myFunction() {}`).
3. Open the file **`apps-script.gs`** from this project, **copy everything**, and **paste it**
   into the Apps Script editor.
4. Click the **💾 Save** icon (or press Ctrl+S).

---

## STEP 3 — Publish it as a web app

1. In the Apps Script editor, click **Deploy ▸ New deployment** (top-right).
2. Click the **gear ⚙ icon** next to "Select type" → choose **Web app**.
3. Fill in:
   - **Description:** `Lead capture`
   - **Execute as:** `Me` (your email)
   - **Who has access:** `Anyone`  ← important, or the website can't send data
4. Click **Deploy**.
5. Google will ask you to **authorize** the script:
   - Click **Authorize access** → pick your account →
   - If you see "Google hasn't verified this app", click **Advanced ▸ Go to … (unsafe)**.
     This is normal — it's **your own** script, not a third party.
   - Click **Allow**.
6. Copy the **Web app URL** shown at the end. It looks like:
   `https://script.google.com/macros/s/AKfy.....long.....string/exec`

---

## STEP 4 — Connect the website to your sheet

1. Open the file **`assets/js/main.js`** (near the top, around line 7).
2. Find this line:
   ```js
   const LEADS_ENDPOINT  = "";
   ```
3. Paste your Web app URL between the quotes:
   ```js
   const LEADS_ENDPOINT  = "https://script.google.com/macros/s/AKfy...../exec";
   ```
4. **Save** the file and **re-deploy / re-upload the website** (e.g. push to Vercel).

✅ Done. Every form submission now creates a new row in your Google Sheet.

---

## 🔎 How to find the sheet & access all your leads

- Go to **https://drive.google.com** (signed in with the same Google account) and open
  **`BA Academy Leads`** any time. Or bookmark the sheet's URL.
- **Consultation requests** appear on the **Consultations** tab (bottom-left tab).
- **Applications** appear on the **Applications** tab.
- Newest lead is the **last row**, with the exact date & time of submission.

**Handy actions inside the sheet:**
- **Share with your team:** click **Share** (top-right) and add their Gmail addresses.
- **Export to Excel:** **File ▸ Download ▸ Microsoft Excel (.xlsx)**.
- **Get notified of new leads:** **Tools ▸ Notification settings ▸ Notify me when…**
  → "Any changes are made" → "Email – right away".
- **Filter / sort:** select the header row → **Data ▸ Create a filter**.

---

## ✅ Quick test (recommended)

1. Open your live website.
2. Submit the **Book Free Consultation** form with test details → you should see
   *"✅ Consultation Request Received!"*.
3. Open the sheet → a new row should appear on the **Consultations** tab.
4. Repeat with **Apply Now** → a new row appears on the **Applications** tab.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| Form shows an error message ("couldn't submit…") | Re-check **STEP 4**: the URL must be the full `…/exec` link, inside the quotes, saved & re-deployed. |
| Rows not appearing | In Apps Script, confirm **Who has access = Anyone**. Re-deploy if you changed it. |
| You edited `apps-script.gs` later | Re-publish: **Deploy ▸ Manage deployments ▸ ✏ Edit ▸ Version: New version ▸ Deploy**. The `/exec` URL stays the same, so you don't touch the website again. |
| Want to verify the endpoint is live | Open the `/exec` URL in a browser — it should say *"businessanalysis.in lead endpoint is live."* |

---

## 📊 (Optional) Google Analytics — mark forms as conversions

The site already sends two GA4 events on successful submission:
`consultation_form_submit` and `application_form_submit`.

To count them as conversions in GA4:
1. Add your **GA4 Measurement ID** (`G-XXXXXXXXXX`) in **`index.html`** (two places near the top).
2. In GA4: **Admin ▸ Events** → toggle **Mark as key event** for both event names
   (they appear after the first real submissions).
