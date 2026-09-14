import { LandEntry } from '../types';

export const INITIAL_LAND_PARCELS: LandEntry[] = [
  {
    id: 'punjab-plot-104-1',
    surveyNumber: 'Khasra No. 104/1',
    ownerName: 'Sardar Gurpreet Singh',
    state: 'Punjab',
    district: 'Ludhiana',
    landType: 'agricultural',
    // Farm polygon in Ludhiana agrarian belt
    coordinates: [
      [30.9020, 75.8540],
      [30.9065, 75.8550],
      [30.9055, 75.8610],
      [30.9010, 75.8595],
    ],
    areaHectares: 26.3,
    areaAcres: 65.0,
    areaSqMeters: 263000,
    registeredAt: '2024-03-12',
    color: '#10b981', // emerald
    notes: 'Registered under PM-KISAN & Punjab Revenue Department. High-yield wheat & paddy acreage.'
  },
  {
    id: 'punjab-plot-104-2',
    surveyNumber: 'Khasra No. 104/2',
    ownerName: 'Hardeep Kaur & Sons',
    state: 'Punjab',
    district: 'Ludhiana',
    landType: 'agricultural',
    // Adjacent parcel to the east, perfectly separated
    coordinates: [
      [30.9055, 75.8615],
      [30.9070, 75.8670],
      [30.9025, 75.8685],
      [30.9010, 75.8620],
    ],
    areaHectares: 28.5,
    areaAcres: 70.4,
    areaSqMeters: 285000,
    registeredAt: '2024-04-18',
    color: '#06b6d4', // cyan
    notes: 'Canal irrigation access from Sirhind feeder canal network.'
  },
  {
    id: 'punjab-plot-encroach',
    surveyNumber: 'Khasra No. 104/Dispute',
    ownerName: 'Vikas Agri-Logistics Corp',
    state: 'Punjab',
    district: 'Ludhiana',
    landType: 'commercial',
    // Overlapping polygon that intersects Khasra No. 104/1
    coordinates: [
      [30.9040, 75.8580],
      [30.9075, 75.8590],
      [30.9068, 75.8630],
      [30.9030, 75.8620],
    ],
    areaHectares: 18.2,
    areaAcres: 45.0,
    areaSqMeters: 182000,
    registeredAt: '2024-08-25',
    color: '#ef4444', // red warning color
    notes: '⚠️ DISPUTED ENTRY: Proposed boundary overlaps with Khasra No. 104/1 and Khasra No. 104/2!'
  }
];

export const SAMPLE_INDIAN_TEMPLATES = [
  {
    name: '🌾 Punjab Farmland (Ludhiana)',
    state: 'Punjab',
    district: 'Ludhiana',
    landType: 'agricultural' as const,
    coordsText: `30.9100, 75.8450\n30.9140, 75.8465\n30.9130, 75.8520\n30.9090, 75.8505`,
    description: '4-sided agricultural farm plot in Central Punjab'
  },
  {
    name: '🏢 Bengaluru Tech Park (Electronic City)',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    landType: 'commercial' as const,
    coordsText: `12.8450, 77.6600\n12.8480, 77.6610\n12.8470, 77.6650\n12.8440, 77.6640`,
    description: 'IT SEZ commercial footprint in South Bengaluru'
  },
  {
    name: '🌊 Varanasi Ganga Basin Plot (UP)',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    landType: 'agricultural' as const,
    coordsText: `25.3120, 83.0010\n25.3160, 83.0030\n25.3140, 83.0080\n25.3100, 83.0060`,
    description: 'Alluvial fertile plain along the holy river Ganga'
  },
  {
    name: '☀️ Bhadla Solar Generation Hub (Rajasthan)',
    state: 'Rajasthan',
    district: 'Jodhpur',
    landType: 'industrial' as const,
    coordsText: `27.5300, 71.9100\n27.5450, 71.9120\n27.5430, 71.9250\n27.5280, 71.9220`,
    description: 'Mega-scale solar array parcel in the Thar Desert'
  },
  {
    name: '⚠️ Conflicting Encroachment Test (Triggers Warning)',
    state: 'Punjab',
    district: 'Ludhiana',
    landType: 'commercial' as const,
    coordsText: `30.9045, 75.8570\n30.9080, 75.8585\n30.9070, 75.8625\n30.9035, 75.8610`,
    description: 'Directly overlaps with Khasra No. 104/1 to test collision warning system'
  }
];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi (NCT)',
  'Jammu & Kashmir',
  'Ladakh'
];
