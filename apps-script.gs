/**
 * businessanalysis.in — Lead capture endpoint (Google Apps Script)
 * ----------------------------------------------------------------
 * Saves every form submission into ONE Google Spreadsheet with TWO tabs:
 *   • "Consultations" ← Book Free Consultation form
 *   • "Applications"  ← Apply Now / Enroll Now form
 *
 * Tabs and header rows are created automatically on the first submission.
 *
 * ── ONE-TIME SETUP (≈5 minutes, no coding) ─────────────────────
 * 1. Sign in to the Google account where you want the leads to live.
 * 2. Open https://sheets.new  → a blank spreadsheet opens.
 *    Rename it (top-left) to e.g. "BA Academy Leads".  (Leave the tabs alone —
 *    the script makes "Consultations" and "Applications" for you.)
 * 3. In that spreadsheet menu:  Extensions ▸ Apps Script.
 * 4. Delete the sample "function myFunction(){}" and PASTE this whole file. Save (💾).
 * 5. Click  Deploy ▸ New deployment.
 *      • Click the gear ⚙ next to "Select type" → choose  Web app
 *      • Description:     Lead capture
 *      • Execute as:      Me (your email)
 *      • Who has access:  Anyone
 *    Click  Deploy.  Google asks you to authorise → Allow (it's your own script).
 * 6. Copy the  Web app URL  (it ends in /exec).
 * 7. Open  assets/js/main.js  and paste that URL into:
 *        const LEADS_ENDPOINT = "https://script.google.com/macros/s/AAAA.../exec";
 *    Save, then redeploy the website. Done — leads now flow into the Sheet.
 *
 * ── HOW TO SEE YOUR LEADS ──────────────────────────────────────
 *   Just open that same spreadsheet from Google Drive (drive.google.com) any time.
 *   New consultation requests land on the "Consultations" tab; applications on the
 *   "Applications" tab — newest row at the bottom, with date & time.
 *   Tip: File ▸ Share to give a teammate access, or File ▸ Download to export to Excel.
 *
 * ── IF YOU EVER CHANGE THE SCRIPT ──────────────────────────────
 *   Re-deploy with  Deploy ▸ Manage deployments ▸ ✏ Edit ▸ Version: New version ▸ Deploy.
 *   (The /exec URL stays the same, so you don't need to touch the website.)
 * ───────────────────────────────────────────────────────────────
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    var when = parseWhen(data.ts);

    if (data.type === "application") {
      var apps = getOrCreate_(ss, "Applications",
        ["Date & Time", "Full Name", "Phone", "Email", "Qualification", "Current Status", "City", "Source"]);
      apps.appendRow([
        when,
        data.name || "",
        data.phone || "",
        data.email || "",
        data.qualification || "",
        data.status || "",
        data.city || "",
        data.source || "Apply Now"
      ]);
    } else {
      var cons = getOrCreate_(ss, "Consultations",
        ["Date & Time", "Full Name", "Phone", "Email", "Background", "Source"]);
      cons.appendRow([
        when,
        data.name || "",
        data.phone || "",
        data.email || "",
        data.background || "",
        data.source || "Book Free Consultation"
      ]);
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("businessanalysis.in lead endpoint is live.");
}

/* ---------- helpers ---------- */
function getOrCreate_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function parseWhen(ts) {
  try { return ts ? new Date(ts) : new Date(); } catch (e) { return new Date(); }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
