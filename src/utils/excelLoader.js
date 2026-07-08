import * as xlsx from 'xlsx';
import { parseThaiDate } from './dateParser';
import { convertUtmToLatLon } from './geoConverter';

export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = xlsx.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(sheet);

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

        resolve(processedData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
