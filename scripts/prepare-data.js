import xlsx from 'xlsx';
import proj4 from 'proj4';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const THAI_MONTHS = {
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

function parseThaiDate(thaiDateStr) {
  if (!thaiDateStr || typeof thaiDateStr !== 'string') return { iso: null, month: null };
  const parts = thaiDateStr.trim().split(/\s+/);
  if (parts.length < 3) return { iso: null, month: null };
  
  const day = parts[0].padStart(2, '0');
  const monthAbbr = parts[1];
  const buddhistYear = parseInt(parts[2], 10);
  
  const month = THAI_MONTHS[monthAbbr];
  if (!month || isNaN(buddhistYear)) return { iso: null, month: null };
  
  const christianYear = buddhistYear - 543;
  return {
    iso: `${christianYear}-${month}-${day}`,
    month: parseInt(month, 10)
  };
}

function convertUtmToLatLon(x, y, zone) {
  if (!x || !y || isNaN(x) || isNaN(y)) return { lat: null, lng: null };
  const numZone = parseInt(zone, 10) || 48;
  const utmProj = `+proj=utm +zone=${numZone} +datum=WGS84 +units=m +no_defs`;
  const wgs84Proj = '+proj=longlat +datum=WGS84 +no_defs';
  
  try {
    const [lng, lat] = proj4(utmProj, wgs84Proj, [Number(x), Number(y)]);
    // Check if within reasonable bounds for Buriram / Thailand
    if (lat > 5 && lat < 21 && lng > 97 && lng < 106) {
      return { lat, lng };
    }
  } catch (e) {
    // Ignore invalid coords
  }
  return { lat: null, lng: null };
}

async function prepare() {
  const excelPath = path.resolve(__dirname, '../ทะเบียนเกษตรกร_จำลอง_ห้วยราช_65-67.xlsx');
  console.log('Reading Excel file from:', excelPath);
  
  if (!fs.existsSync(excelPath)) {
    console.error('Excel file not found at:', excelPath);
    process.exit(1);
  }

  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(sheet);
  
  console.log(`Parsed ${rawData.length} rows from Excel sheet "${sheetName}". Converting and structuring data...`);

  const processedData = rawData.map((row, idx) => {
    const { lat, lng } = convertUtmToLatLon(row['X'], row['Y'], row['ZONE']);
    const plantDate = parseThaiDate(row['ปลูก']);
    const harvestDate = parseThaiDate(row['เก็บเกี่ยว']);

    return {
      id: row['ACTIVITY_ID'] || `act_${idx}`,
      farmerName: row['ชื่อ-นามสกุล'] ? String(row['ชื่อ-นามสกุล']).trim() : 'ไม่ระบุชื่อ',
      farmerAddress: {
        moo: row['หมู่'] ?? '',
        tambon: row['ตำบล'] ?? '',
        amphoe: row['อำเภอ'] ?? '',
        province: row['จังหวัด'] ?? ''
      },
      landDeed: {
        type: row['ประเภท'] ?? 'ไม่มีเอกสารสิทธิ์',
        number: row['เลขที่'] ?? '',
        ownership: row['การถือครอง'] ?? 'อื่นๆ',
        docArea: {
          rai: Number(row['เนื้อที่เอกสาร(ไร่)'] || 0),
          ngan: Number(row['เนื้อที่เอกสาร(งาน)'] || 0),
          wah: Number(row['เนื้อที่เอกสาร(ตร.วา)'] || 0)
        }
      },
      location: {
        moo: row['หมู่_1'] ?? '',
        tambon: row['ตำบล_1'] ?? 'ไม่ระบุตำบล',
        amphoe: row['อำเภอ_1'] ?? 'ห้วยราช',
        province: row['จังหวัด_1'] ?? 'บุรีรัมย์',
        zone: row['ZONE'] ?? null,
        utmX: row['X'] ?? null,
        utmY: row['Y'] ?? null,
        lat,
        lng
      },
      crop: {
        type: row['พืช'] ?? 'ไม่ระบุพืช',
        variety: row['พันธุ์'] ?? 'ไม่ระบุพันธุ์'
      },
      area: {
        totalRai: Number(row['เนื้อที่รวม(ไร่)']) || 0,
        rai: Number(row['เนื้อที่(ไร่)'] || 0),
        ngan: Number(row['เนื้อที่(งาน)'] || 0),
        wah: Number(row['เนื้อที่(ตร.วา)'] || 0)
      },
      dates: {
        plantText: row['ปลูก'] ?? '-',
        plantIso: plantDate.iso,
        plantMonth: plantDate.month,
        harvestText: row['เก็บเกี่ยว'] ?? '-',
        harvestIso: harvestDate.iso,
        harvestMonth: harvestDate.month
      },
      workflow: {
        status: row['สถานะการประชาคม'] ?? 'รอประชาคม',
        sendIncomeDate: row['วันที่ส่งข้อมูลประกันรายได้ฯ'] ?? '-',
        sendSupportDate: row['วันที่ส่งข้อมูลสนับสนุนฯ.'] ?? '-',
        recordDate: row['วันที่บันทึก'] ?? '-'
      },
      sourceSystem: row['บันทึกจาก'] ?? 'ไม่ระบุ',
      year: String(row['ปีทะเบียน'] || '2567')
    };
  });

  // Create public/data directory if not exists
  const outDir = path.resolve(__dirname, '../public/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'huairach_farmers.json');
  fs.writeFileSync(outPath, JSON.stringify(processedData), 'utf-8');

  console.log(`Successfully prepared and saved ${processedData.length} records to ${outPath}`);

  // Quick summary stats
  const uniqueFarmers = new Set(processedData.map(d => d.farmerName)).size;
  const missingCoords = processedData.filter(d => d.location.lat === null).length;
  console.log(`Summary Stats: Unique Farmers: ${uniqueFarmers}, Missing Coords: ${missingCoords}`);
}

prepare().catch(err => {
  console.error('Error preparing data:', err);
  process.exit(1);
});
