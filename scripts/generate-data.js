// scripts/generate-data.js
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const EXCEL_NAME = 'prayer app country_partner_prayer prompt.xlsx';
const excelPath = path.join(process.cwd(), EXCEL_NAME);
const outPath = path.join(process.cwd(), 'data', 'prayerData.json');

function normalizeCountry(name) {
  return String(name || '').trim();
}

function normalizePartner(name) {
  return String(name || '').trim();
}

function normalizePrompt(text) {
  return String(text || '').trim();
}

if (!fs.existsSync(excelPath)) {
  console.error(`❌ Cannot find "${EXCEL_NAME}" in project root.`);
  process.exit(1);
}

const wb = xlsx.readFile(excelPath);
const sheetName = wb.SheetNames[0];
const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

// Try to detect column headers flexibly
const countryKeys = ['Country', 'country'];
const partnerKeys = ['Partner name', 'Partner', 'partner', 'partner name'];
const promptKeys  = ['Prayer prompt', 'Prayer promt', 'Prayer', 'prayer', 'prompt'];

function pick(obj, keys) {
  for (const k of keys) if (k in obj) return obj[k];
  return '';
}

const data = rows.map((r) => {
  const country = normalizeCountry(pick(r, countryKeys));
  const partner = normalizePartner(pick(r, partnerKeys));
  const prompt  = normalizePrompt(pick(r, promptKeys));

  // Build expected image filename
  const safeCountry = country.replace(/[\/\\:*?"<>|]/g, '-');
  const safePartner = partner.replace(/[\/\\:*?"<>|]/g, '-');
  const expectedImage = partner
    ? `/partner-images/${safeCountry}_${safePartner}.png`
    : `/partner-images/${safeCountry}_flag.png`;

  return {
    country,
    partner,
    prompt,
    image: expectedImage
  };
}).filter(x => x.country); // keep only entries with country

fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ Generated ${outPath} with ${data.length} records.`);
