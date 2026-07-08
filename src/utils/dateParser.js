export const THAI_MONTHS = {
  'ม.ค.': '01',
  'ก.พ.': '02',
  'มี.ค.': '03',
  'เม.ย.': '04',
  'พ.ค.': '05',
  'มิ.ย.': '06',
  'ก.ค.': '07',
  'ส.ค.': '08',
  'ก.ย.': '09',
  'ต.ค.': '10',
  'พ.ย.': '11',
  'ธ.ค.': '12'
};

export const THAI_MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTH_SHORT_NAMES = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export function parseThaiDate(thaiDateStr) {
  if (!thaiDateStr || typeof thaiDateStr !== 'string') return { iso: null, month: null, year: null };
  const parts = thaiDateStr.trim().split(/\s+/);
  if (parts.length < 3) return { iso: null, month: null, year: null };
  
  const day = parts[0].padStart(2, '0');
  const monthAbbr = parts[1];
  const buddhistYear = parseInt(parts[2], 10);
  
  const month = THAI_MONTHS[monthAbbr];
  if (!month || isNaN(buddhistYear)) return { iso: null, month: null, year: null };
  
  const christianYear = buddhistYear - 543;
  return {
    iso: `${christianYear}-${month}-${day}`,
    month: parseInt(month, 10),
    year: buddhistYear
  };
}

export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

export function formatRai(rai, ngan, wah) {
  return `${formatNumber(rai, 0)} ไร่ ${formatNumber(ngan, 0)} งาน ${formatNumber(wah, 0)} ตร.วา`;
}
