// ============================================================
// Tiga Kisah dari Babylon — Apps Script Web App
// Serves content.json-compatible JSON from a Google Spreadsheet.
//
// Cara pakai:
//   1. Buka Google Apps Script (script.google.com).
//   2. Copy-paste isi file ini ke editor.
//   3. Jalankan fungsi setupSheet() sekali — ini akan bikin
//      Spreadsheet baru dengan header & data contoh.
//   4. Copy ID Spreadsheet dari log ke variabel SPREADSHEET_ID.
//   5. Deploy sebagai Web App (Execute as: Me, Who has access: Anyone).
//   6. Copy URL Web App ke variabel WEB_APP_URL di script.js.
// ============================================================

// === ISI MANUAL SETELAH setupSheet() JALAN & DEPLOY SENDIRI ===
var SPREADSHEET_ID = "1yh6ESTk9MlPW3hwXyphydBIKivl5BXWjSc_tRhKyz2o";

/**
 * setupSheet() — jalankan sekali dari editor untuk membuat spreadsheet.
 * Membuat 3 sheet: meta, kisah, benangMerah.
 * Data contoh diisi supaya doGet() bisa langsung diuji.
 */
function setupSheet() {
  var ss = SpreadsheetApp.create("Tiga Kisah dari Babylon — Data");
  var metaSheet = ss.getActiveSheet();
  metaSheet.setName("meta");
  metaSheet.appendRow(["key", "value"]);
  metaSheet.appendRow(["judul", "Tiga Kisah dari Babylon"]);
  metaSheet.appendRow(["subjudul", "Tentang Tanggung Jawab, Disiplin, dan Konsistensi Tanpa Penonton"]);

  var kisahSheet = ss.insertSheet("kisah");
  kisahSheet.appendRow(["id", "judul", "paragraf", "paragrafPenutup"]);

  var benangSheet = ss.insertSheet("benangMerah");
  benangSheet.appendRow(["judul", "paragraf"]);

  Logger.log("Spreadsheet created: " + ss.getId());
  Logger.log("Url: " + ss.getUrl());
  Logger.log("ISI SPREADSHEET_ID di atas dengan: " + ss.getId());
}

/**
 * doGet(e) — Web App entry point.
 * Returns JSON with the exact shape consumed by renderKisah() / renderBenangMerah()
 * in script.js:
 *   { judul, subjudul, kisah: [...], benangMerah: { judul, paragraf } }
 *
 * Simple GET only — no custom headers (avoids CORS preflight).
 */
function doGet(e) {
  var content = assembleContent();
  return ContentService.createTextOutput(JSON.stringify(content))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── internal helpers ──────────────────────────────────────────

function getMeta_(ss) {
  var sheet = ss.getSheetByName("meta");
  if (!sheet) return {};
  var data = sheet.getDataRange().getValues();
  var meta = {};
  for (var i = 1; i < data.length; i++) {
    meta[data[i][0]] = data[i][1];
  }
  return meta;
}

function getKisah_(ss) {
  var sheet = ss.getSheetByName("kisah");
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var kisah = [];
  for (var i = 1; i < data.length; i++) {
    kisah.push({
      id: data[i][0],
      judul: data[i][1],
      paragraf: splitParagraf_(data[i][2]),
      paragrafPenutup: data[i][3] || undefined
    });
  }
  return kisah;
}

function getBenangMerah_(ss) {
  var sheet = ss.getSheetByName("benangMerah");
  if (!sheet) return { judul: "", paragraf: [] };
  var data = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    rows.push(data[i]);
  }
  if (rows.length === 0) return { judul: "", paragraf: [] };
  return {
    judul: rows[0][0] || "",
    paragraf: splitParagraf_(rows[0][1])
  };
}

function parseJSON_(value, fallback) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
}

/**
 * splitParagraf_(value) — split a cell value containing newline-separated
 * paragraphs into an array of trimmed strings.
 * Handles \n (Alt+Enter in Google Sheets) and \r\n.
 * Falls back to parseJSON_() for backward-compat with JSON-encoded arrays.
 */
function splitParagraf_(value) {
  if (value == null) return [];
  var raw = String(value).trim();
  if (!raw) return [];
  // Try JSON parse first (backward compat with ["para1","para2"] format)
  var jsonParsed = parseJSON_(raw, null);
  if (Array.isArray(jsonParsed)) return jsonParsed;
  // Split by newlines: \r\n, \r, or \n
  return raw.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
}

function assembleContent() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var meta = getMeta_(ss);
  return {
    judul: meta.judul || "",
    subjudul: meta.subjudul || "",
    kisah: getKisah_(ss),
    benangMerah: getBenangMerah_(ss)
  };
}
