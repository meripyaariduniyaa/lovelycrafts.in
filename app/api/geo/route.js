import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ISO_TO_GST_STATE = {
  JK: { code: '01', name: 'Jammu & Kashmir' },
  HP: { code: '02', name: 'Himachal Pradesh' },
  PB: { code: '03', name: 'Punjab' },
  CH: { code: '04', name: 'Chandigarh' },
  UT: { code: '05', name: 'Uttarakhand' },
  UK: { code: '05', name: 'Uttarakhand' },
  HR: { code: '06', name: 'Haryana' },
  DL: { code: '07', name: 'Delhi' },
  RJ: { code: '08', name: 'Rajasthan' },
  UP: { code: '09', name: 'Uttar Pradesh' },
  BR: { code: '10', name: 'Bihar' },
  SK: { code: '11', name: 'Sikkim' },
  AR: { code: '12', name: 'Arunachal Pradesh' },
  NL: { code: '13', name: 'Nagaland' },
  MN: { code: '14', name: 'Manipur' },
  MZ: { code: '15', name: 'Mizoram' },
  TR: { code: '16', name: 'Tripura' },
  ML: { code: '17', name: 'Meghalaya' },
  AS: { code: '18', name: 'Assam' },
  WB: { code: '19', name: 'West Bengal' },
  JH: { code: '20', name: 'Jharkhand' },
  OR: { code: '21', name: 'Odisha' },
  OD: { code: '21', name: 'Odisha' },
  CT: { code: '22', name: 'Chhattisgarh' },
  CG: { code: '22', name: 'Chhattisgarh' },
  MP: { code: '23', name: 'Madhya Pradesh' },
  GJ: { code: '24', name: 'Gujarat' },
  DH: { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  DD: { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  DN: { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  MH: { code: '27', name: 'Maharashtra' },
  AP: { code: '37', name: 'Andhra Pradesh' },
  KA: { code: '29', name: 'Karnataka' },
  GA: { code: '30', name: 'Goa' },
  LD: { code: '31', name: 'Lakshadweep' },
  KL: { code: '32', name: 'Kerala' },
  TN: { code: '33', name: 'Tamil Nadu' },
  PY: { code: '34', name: 'Puducherry' },
  AN: { code: '35', name: 'Andaman & Nicobar Islands' },
  TG: { code: '36', name: 'Telangana' },
  TS: { code: '36', name: 'Telangana' },
  LA: { code: '38', name: 'Ladakh' },
};

export async function GET(request) {
  const isoRegion = (request?.headers?.get?.('x-vercel-ip-country-region') || '').toUpperCase().trim();
  const state = ISO_TO_GST_STATE[isoRegion] || null;

  return NextResponse.json({
    success: true,
    country: 'IN',
    isIndia: true,
    isOverridden: false,
    source: isoRegion ? 'x-vercel-ip-country-region' : 'unrestricted',
    isoRegion,
    stateCode: state?.code || '',
    stateName: state?.name || '',
    message: 'Purchases unrestricted.',
  });
}
