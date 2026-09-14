import { GeoPreset, GeoModel, GeoTask, InferenceResult, LandCoverDistribution, DetectionBox, SegmentationPolygon } from '../types';

export const GEO_PRESETS: GeoPreset[] = [
  {
    id: 'punjab-agri',
    name: 'Punjab Agrarian Belt & Khasra Plots',
    location: 'Ludhiana, Punjab, India',
    category: 'Cadastral & Agricultural Land',
    center: [30.9040, 75.8600],
    zoom: 14,
    description: 'Intensively cultivated agrarian parcels, irrigation canals, and cadastral survey plots in Central Punjab.',
    defaultTask: 'segmentation',
    satelliteSource: 'ISRO Resourcesat-2 / Sentinel-2 L2A',
    resolution: '0.8m / 5.8m Multispectral',
    acquisitionDate: '2024-09-10',
    bounds: [
      [30.8850, 75.8400],
      [30.9250, 75.8800]
    ],
    stats: {
      areaKm2: 24.5,
      clouds: 0.2,
      sensor: 'Resourcesat LISS-IV + Sentinel-2A'
    }
  },
  {
    id: 'bengaluru-tech',
    name: 'Bengaluru IT Corridor (Electronic City)',
    location: 'Karnataka, India',
    category: 'Urban Cadastre & Commercial Land',
    center: [12.8452, 77.6602],
    zoom: 14,
    description: 'High-density tech parks, metro rail alignments, lakes, and commercial land parcels in South Bengaluru.',
    defaultTask: 'detection',
    satelliteSource: 'Cartosat-3 / PlanetScope (0.5m)',
    resolution: '0.5m Optical High-Res',
    acquisitionDate: '2024-08-20',
    bounds: [
      [12.8300, 77.6400],
      [12.8600, 77.6800]
    ],
    stats: {
      areaKm2: 18.2,
      clouds: 1.0,
      sensor: 'Cartosat-3 PAN + MX'
    }
  },
  {
    id: 'varanasi-ganga',
    name: 'Varanasi Ganga River Basin',
    location: 'Uttar Pradesh, India',
    category: 'Hydrology & Riparian Cadastre',
    center: [25.3176, 83.0062],
    zoom: 14,
    description: 'Historic riverfront ghats, floodplains, sandbars, and fertile agricultural land parcels along River Ganga.',
    defaultTask: 'landcover',
    satelliteSource: 'Sentinel-2 & Cartosat-2',
    resolution: '1.0m / 10m Multi-spectral',
    acquisitionDate: '2024-07-15',
    bounds: [
      [25.2900, 82.9800],
      [25.3400, 83.0300]
    ],
    stats: {
      areaKm2: 32.0,
      clouds: 2.3,
      sensor: 'Sentinel-2 MSI'
    }
  },
  {
    id: 'bhadla-solar',
    name: 'Bhadla Solar Park (Thar Desert)',
    location: 'Phalodi, Rajasthan, India',
    category: 'Renewable Energy & Arid Cadastre',
    center: [27.5385, 71.9160],
    zoom: 13,
    description: 'One of the world\'s largest solar installations spanning over 14,000 acres in the arid sands of Rajasthan.',
    defaultTask: 'segmentation',
    satelliteSource: 'Sentinel-2 L2A',
    resolution: '10m Bands 2,3,4,8',
    acquisitionDate: '2024-08-01',
    bounds: [
      [27.5000, 71.8800],
      [27.5800, 71.9600]
    ],
    stats: {
      areaKm2: 120.0,
      clouds: 0.0,
      sensor: 'Sentinel-2A MSI'
    }
  },
  {
    id: 'mumbai-port',
    name: 'Mumbai Coastal Land & JNPT Port',
    location: 'Maharashtra, India',
    category: 'Coastal Cadastre & Maritime Infrastructure',
    center: [18.9500, 72.9500],
    zoom: 13,
    description: 'Major container seaport, mangrove conservation zones, coastal infrastructure, and reclamation plots.',
    defaultTask: 'change_detection',
    satelliteSource: 'Sentinel-1 SAR & Sentinel-2',
    resolution: '10m Optical + Radar',
    acquisitionDate: '2024-09-05',
    bounds: [
      [18.9200, 72.9100],
      [18.9800, 72.9900]
    ],
    stats: {
      areaKm2: 45.0,
      clouds: 1.5,
      sensor: 'Sentinel-1B IW + Sentinel-2B'
    }
  },
  {
    id: 'sfo-airport',
    name: 'San Francisco Bay & SFO Airport',
    location: 'California, USA',
    category: 'Aviation & Urban Infrastructure',
    center: [37.6213, -122.3790],
    zoom: 14,
    description: 'High-resolution coastal airport with active runways, taxiways, terminals, and coastal wetland margins.',
    defaultTask: 'detection',
    satelliteSource: 'Sentinel-2 & NAIP Aerial (0.6m)',
    resolution: '0.6m / 10m Multi-spectral',
    acquisitionDate: '2024-08-15',
    bounds: [
      [37.6080, -122.4000],
      [37.6350, -122.3600]
    ],
    stats: {
      areaKm2: 21.4,
      clouds: 1.2,
      sensor: 'NAIP + Sentinel-2A L2A'
    }
  },
  {
    id: 'rotterdam-port',
    name: 'Port of Rotterdam (Maasvlakte)',
    location: 'Rotterdam, Netherlands',
    category: 'Maritime & Logistics',
    center: [51.9560, 4.0280],
    zoom: 14,
    description: 'Deepwater container terminals, oil storage depots, breakwaters, and maritime vessel traffic in Europe\'s largest seaport.',
    defaultTask: 'detection',
    satelliteSource: 'Sentinel-2 L2A + PlanetScope',
    resolution: '3.0m Optical',
    acquisitionDate: '2024-07-22',
    bounds: [
      [51.9400, 4.0000],
      [51.9700, 4.0600]
    ],
    stats: {
      areaKm2: 28.6,
      clouds: 0.5,
      sensor: 'PlanetScope 8-band + Sentinel-2B'
    }
  },
  {
    id: 'dubai-palm',
    name: 'Palm Jumeirah & Coastal Dubai',
    location: 'Dubai, United Arab Emirates',
    category: 'Coastal Land Reclamation & Urban',
    center: [25.1124, 55.1389],
    zoom: 13,
    description: 'Iconic artificial archipelago showing intricate engineered coastlines, high-density luxury villas, and breakwaters.',
    defaultTask: 'segmentation',
    satelliteSource: 'Sentinel-2 Multispectral (10m)',
    resolution: '10m Bands 2,3,4,8',
    acquisitionDate: '2024-09-02',
    bounds: [
      [25.0900, 55.1100],
      [25.1350, 55.1680]
    ],
    stats: {
      areaKm2: 34.2,
      clouds: 0.0,
      sensor: 'Sentinel-2 MSI'
    }
  },
  {
    id: 'amazon-rondonia',
    name: 'Rondônia Deforestation Frontier',
    location: 'Amazon Basin, Brazil',
    category: 'Environmental & Forest Change',
    center: [-10.8770, -62.4550],
    zoom: 12,
    description: 'Fishbone pattern deforestation along federal highway BR-364 showing tropical rainforest conversion to cattle pasture.',
    defaultTask: 'change_detection',
    satelliteSource: 'Landsat-8 & Sentinel-2 Harmonized',
    resolution: '10m / 30m Time Series',
    acquisitionDate: '2020 - 2024 Bi-Temporal',
    bounds: [
      [-10.9500, -62.5500],
      [-10.8000, -62.3500]
    ],
    stats: {
      areaKm2: 185.0,
      clouds: 4.8,
      sensor: 'Harmonized Landsat Sentinel (HLS)'
    }
  },
  {
    id: 'ivanpah-solar',
    name: 'Ivanpah Solar Electric Generating System',
    location: 'Mojave Desert, California',
    category: 'Renewable Energy & Infrastructure',
    center: [35.5568, -115.4705],
    zoom: 14,
    description: 'Concentrated solar thermal power plant spanning 3,500 acres with over 170,000 dual-mirror heliostats around three central towers.',
    defaultTask: 'segmentation',
    satelliteSource: 'NAIP Aerial Ortho (0.6m)',
    resolution: '0.6m 4-band',
    acquisitionDate: '2024-06-18',
    bounds: [
      [35.5400, -115.4950],
      [35.5750, -115.4450]
    ],
    stats: {
      areaKm2: 14.8,
      clouds: 0.0,
      sensor: 'NAIP Digital Sensor System'
    }
  },
  {
    id: 'mount-st-helens',
    name: 'Mount St. Helens Crater & Pumice Plain',
    location: 'Washington, USA',
    category: 'Geomorphology & Ecological Succession',
    center: [46.1914, -122.1956],
    zoom: 13,
    description: 'Post-eruption caldera, lava dome regrowth, and 40-year ecological recovery on the pumice plain.',
    defaultTask: 'canopy',
    satelliteSource: 'Sentinel-2 L2A Surface Reflectance',
    resolution: '10m Red/NIR/SWIR',
    acquisitionDate: '2024-07-30',
    bounds: [
      [46.1600, -122.2400],
      [46.2200, -122.1500]
    ],
    stats: {
      areaKm2: 52.0,
      clouds: 2.1,
      sensor: 'Sentinel-2A MSI'
    }
  }
];

export const GEO_MODELS: GeoModel[] = [
  {
    id: 'prithvi-100m',
    name: 'Prithvi-100M (NASA & IBM)',
    category: 'foundation',
    framework: 'PyTorch / HuggingFace Transformers',
    parameterCount: '100M Params',
    weightsSize: '412 MB',
    license: 'Apache 2.0',
    huggingfaceUrl: 'https://huggingface.co/ibm-nasa-geospatial/Prithvi-100M',
    description: 'First open-source geospatial foundation model trained on Harmonized Landsat-Sentinel (HLS) multi-temporal multi-spectral imagery. Supports fine-tuning for flood mapping, crop classification, and biomass estimation.',
    supportedBackbones: ['ViT-Base', 'Temporal Encoder', 'Swin-Spatial']
  },
  {
    id: 'sam-geospatial',
    name: 'Segment Anything (SAM) Geospatial',
    category: 'segmentation',
    framework: 'Meta AI / Segment-Geospatial',
    parameterCount: '636M Params (SAM-HQ)',
    weightsSize: '2.4 GB',
    license: 'Apache 2.0',
    huggingfaceUrl: 'https://huggingface.co/facebook/sam-vit-huge',
    description: 'Zero-shot promptable segmentation adapted for aerial and satellite tiles. Supports bounding box prompts, point prompts, and regular grid automatic mask generation.',
    supportedBackbones: ['ViT-H', 'ViT-L', 'ViT-B']
  },
  {
    id: 'rf-detr-satellite',
    name: 'RF-DETR Satellite Object Detector',
    category: 'detection',
    framework: 'PyTorch / RT-DETR',
    parameterCount: '32M Params',
    weightsSize: '128 MB',
    license: 'MIT',
    huggingfaceUrl: 'https://huggingface.co/opengeos/rf-detr-vhr10',
    description: 'Real-time detection transformer trained on high-resolution satellite imagery (NWPU VHR-10 & DOTA). Detects airplanes, ships, storage tanks, bridges, harbor basins, and ground vehicles.',
    supportedBackbones: ['ResNet-50', 'HGNetv2', 'Transformer Encoder-Decoder']
  },
  {
    id: 'changestar-flair',
    name: 'ChangeStar Bi-temporal Change Detection',
    category: 'change_detection',
    framework: 'PyTorch / TorchChange',
    parameterCount: '48M Params',
    weightsSize: '190 MB',
    license: 'MIT',
    description: 'Detects structural, land cover, and infrastructure modifications between two satellite image acquisitions regardless of seasonal illumination variations.',
    supportedBackbones: ['ResNet-50 Siamese', 'FarSeg Head', 'ChangeStar Module']
  },
  {
    id: 'canopy-eth-gedi',
    name: 'ETH Global Canopy Height Model (10m)',
    category: 'canopy',
    framework: 'PyTorch / TorchGeo',
    parameterCount: '24M Params',
    weightsSize: '95 MB',
    license: 'CC-BY 4.0',
    description: 'Estimates forest canopy height in meters per 10m pixel globally, trained using Sentinel-2 imagery calibrated against spaceborne LiDAR (GEDI).',
    supportedBackbones: ['DenseNet-121', 'Spatial Pyramid Pooling']
  },
  {
    id: 'worldcover-10m',
    name: 'ESA WorldCover 10-Class Classifier',
    category: 'landcover',
    framework: 'PyTorch / SMP',
    parameterCount: '42M Params',
    weightsSize: '168 MB',
    license: 'CC-BY 4.0',
    description: '10-class global land use and land cover (LULC) segmentation: Tree cover, Shrubland, Grassland, Cropland, Built-up, Bare vegetation, Snow/Ice, Water bodies, Wetland, Mangroves.',
    supportedBackbones: ['UNet++', 'ConvNeXt-Base', 'FPN-EfficientNet-B4']
  },
  {
    id: 'esrgan-geospatial',
    name: 'ESRGAN Remote Sensing Super-Resolution (4x)',
    category: 'foundation',
    framework: 'PyTorch / RRDBNet',
    parameterCount: '16.7M Params',
    weightsSize: '67 MB',
    license: 'Apache 2.0',
    description: 'Deep Residual-in-Residual Dense Network trained to upscale 10m Sentinel-2 or 30m Landsat tiles into crisp, high-frequency spatial details (4x upscale factor).',
    supportedBackbones: ['RRDB Generator', 'VGG Perceptual Feature Extractor']
  },
  {
    id: 'universat-vit',
    name: 'UniverSat Multi-Sensor Representation',
    category: 'foundation',
    framework: 'PyTorch / HuggingFace',
    parameterCount: '86M Params',
    weightsSize: '344 MB',
    license: 'Apache 2.0',
    description: 'Universal satellite backbone trained across 15 optical, SAR, and multispectral sensors with zero-shot tile embeddings and PCA false-color decomposition.',
    supportedBackbones: ['Vision Transformer Base (ViT-B/16)']
  }
];

export const ESA_LANDCOVER_CLASSES = [
  { code: 10, name: 'Tree Cover', color: '#006400' },
  { code: 20, name: 'Shrubland', color: '#ffbb22' },
  { code: 30, name: 'Grassland', color: '#ffff4c' },
  { code: 40, name: 'Cropland', color: '#f096ff' },
  { code: 50, name: 'Built-up / Urban', color: '#fa0000' },
  { code: 60, name: 'Bare / Sparse Veg', color: '#b4b4b4' },
  { code: 70, name: 'Snow & Ice', color: '#f0f0f0' },
  { code: 80, name: 'Permanent Water', color: '#0064c8' },
  { code: 90, name: 'Herbaceous Wetland', color: '#0096a0' },
  { code: 95, name: 'Mangroves', color: '#00cf75' },
];

// Helper to generate task-specific simulated real inference results
export function generateInferenceResult(preset: GeoPreset, task: GeoTask, modelId: string): InferenceResult {
  const [lat, lng] = preset.center;
  const dLat = (preset.bounds[1][0] - preset.bounds[0][0]) * 0.4;
  const dLng = (preset.bounds[1][1] - preset.bounds[0][1]) * 0.4;

  let detections: DetectionBox[] = [];
  let segmentations: SegmentationPolygon[] = [];
  let landCover: LandCoverDistribution[] = [];
  let metrics: InferenceResult['metrics'] = {};
  let summary = '';

  if (task === 'detection') {
    if (preset.id === 'sfo-airport') {
      detections = [
        {
          id: 'det-1',
          label: 'Commercial Airplane (Wide-body)',
          confidence: 0.96,
          bounds: [[lat + 0.002, lng - 0.005], [lat + 0.004, lng - 0.002]],
          attributes: { spanMeters: 62, orientationDeg: 45 }
        },
        {
          id: 'det-2',
          label: 'Commercial Airplane (Narrow-body)',
          confidence: 0.94,
          bounds: [[lat - 0.003, lng - 0.006], [lat - 0.001, lng - 0.004]],
          attributes: { spanMeters: 38, orientationDeg: 45 }
        },
        {
          id: 'det-3',
          label: 'Commercial Airplane (Narrow-body)',
          confidence: 0.91,
          bounds: [[lat - 0.006, lng - 0.008], [lat - 0.004, lng - 0.006]],
          attributes: { spanMeters: 35, orientationDeg: 40 }
        },
        {
          id: 'det-4',
          label: 'Runway Intersection (01R/19L)',
          confidence: 0.98,
          bounds: [[lat - 0.008, lng + 0.001], [lat - 0.003, lng + 0.009]],
          attributes: { lengthMeters: 2600, surface: 'Asphalt' }
        },
        {
          id: 'det-5',
          label: 'Terminal Concourse Pier G',
          confidence: 0.95,
          bounds: [[lat + 0.005, lng - 0.012], [lat + 0.010, lng - 0.005]],
          attributes: { gates: 14, areaM2: 24500 }
        },
        {
          id: 'det-6',
          label: 'Jet Fuel Storage Tank',
          confidence: 0.89,
          bounds: [[lat - 0.012, lng - 0.015], [lat - 0.009, lng - 0.012]],
          attributes: { diameterM: 42, capacityM3: 25000 }
        }
      ];
      metrics = { precision: 0.932, recall: 0.908, f1Score: 0.920, detectedCount: detections.length };
      summary = `RF-DETR identified ${detections.length} objects with mean confidence ${(detections.reduce((a, b) => a + b.confidence, 0) / detections.length * 100).toFixed(1)}%. Identified commercial aircraft parked at gates, runway vectors, and aviation fuel storage infrastructure.`;
    } else if (preset.id === 'rotterdam-port') {
      detections = [
        {
          id: 'det-p1',
          label: 'Ultra-Large Container Vessel (ULCV)',
          confidence: 0.97,
          bounds: [[lat - 0.004, lng - 0.012], [lat + 0.001, lng + 0.005]],
          attributes: { lengthMeters: 399, beamMeters: 59, status: 'Moored' }
        },
        {
          id: 'det-p2',
          label: 'Feeder Container Ship',
          confidence: 0.93,
          bounds: [[lat + 0.006, lng + 0.008], [lat + 0.009, lng + 0.015]],
          attributes: { lengthMeters: 175, status: 'Berthing' }
        },
        {
          id: 'det-p3',
          label: 'Chemical / Crude Oil Tanker',
          confidence: 0.92,
          bounds: [[lat - 0.010, lng + 0.012], [lat - 0.006, lng + 0.022]],
          attributes: { lengthMeters: 245, draftMeters: 14.5 }
        },
        {
          id: 'det-p4',
          label: 'STS Ship-to-Shore Gantry Crane Cluster',
          confidence: 0.95,
          bounds: [[lat - 0.002, lng - 0.018], [lat + 0.004, lng - 0.014]],
          attributes: { craneUnits: 8, outreachM: 65 }
        }
      ];
      metrics = { precision: 0.954, recall: 0.921, f1Score: 0.937, detectedCount: detections.length };
      summary = `Vessel & Port Infrastructure Detector recognized 3 active commercial ships (including a 399m ULCV) and 8 STS gantry cranes across the Maasvlakte deepwater quays.`;
    } else {
      detections = [
        {
          id: 'det-gen-1',
          label: 'Infrastructure Cluster',
          confidence: 0.91,
          bounds: [[lat - dLat * 0.5, lng - dLng * 0.5], [lat + dLat * 0.5, lng + dLng * 0.5]],
        },
        {
          id: 'det-gen-2',
          label: 'Transport Corridor',
          confidence: 0.88,
          bounds: [[lat - dLat * 0.8, lng - dLng * 0.2], [lat - dLat * 0.2, lng + dLng * 0.7]],
        }
      ];
      metrics = { precision: 0.89, recall: 0.86, f1Score: 0.875, detectedCount: 2 };
      summary = `Detected 2 primary structural and transport features with RF-DETR backbone.`;
    }
  } else if (task === 'segmentation') {
    if (preset.id === 'dubai-palm') {
      segmentations = [
        {
          id: 'seg-1',
          label: 'Engineered Crescent Breakwater',
          confidence: 0.96,
          color: '#38bdf8',
          areaKm2: 3.82,
          points: [
            [lat + 0.018, lng - 0.024],
            [lat + 0.022, lng - 0.008],
            [lat + 0.023, lng + 0.006],
            [lat + 0.019, lng + 0.022],
            [lat + 0.016, lng + 0.020],
            [lat + 0.019, lng + 0.004],
            [lat + 0.019, lng - 0.010],
            [lat + 0.015, lng - 0.022]
          ]
        },
        {
          id: 'seg-2',
          label: 'Palm Fronds (Reclaimed Residential)',
          confidence: 0.94,
          color: '#f59e0b',
          areaKm2: 5.40,
          points: [
            [lat + 0.012, lng - 0.018],
            [lat + 0.014, lng - 0.002],
            [lat + 0.011, lng + 0.016],
            [lat + 0.002, lng + 0.018],
            [lat - 0.006, lng + 0.008],
            [lat - 0.008, lng - 0.006],
            [lat - 0.001, lng - 0.016]
          ]
        },
        {
          id: 'seg-3',
          label: 'Central Trunk Spine & Marinas',
          confidence: 0.95,
          color: '#ec4899',
          areaKm2: 2.15,
          points: [
            [lat - 0.008, lng - 0.005],
            [lat - 0.007, lng + 0.005],
            [lat - 0.022, lng + 0.006],
            [lat - 0.023, lng - 0.004]
          ]
        },
        {
          id: 'seg-4',
          label: 'Interior Lagoon Waterways',
          confidence: 0.98,
          color: '#0284c7',
          areaKm2: 8.60,
          points: [
            [lat + 0.016, lng - 0.020],
            [lat + 0.017, lng + 0.018],
            [lat + 0.005, lng + 0.014],
            [lat + 0.006, lng - 0.014]
          ]
        }
      ];
      metrics = { mIoU: 0.884, precision: 0.92, recall: 0.89, f1Score: 0.905 };
      summary = `SAM-Geospatial parsed four high-precision geographic boundaries: the 11km outer crescent breakwater, 16 residential fronds, central access trunk, and inner marine lagoons. Total segmented area: 19.97 km².`;
    } else if (preset.id === 'ivanpah-solar') {
      segmentations = [
        {
          id: 'seg-sol-1',
          label: 'Unit 1 Heliostat Solar Mirror Array',
          confidence: 0.95,
          color: '#eab308',
          areaKm2: 4.85,
          points: [
            [lat - 0.008, lng - 0.020],
            [lat + 0.006, lng - 0.018],
            [lat + 0.004, lng - 0.004],
            [lat - 0.010, lng - 0.006]
          ]
        },
        {
          id: 'seg-sol-2',
          label: 'Unit 2 & 3 Solar Field Concentrators',
          confidence: 0.94,
          color: '#f97316',
          areaKm2: 6.20,
          points: [
            [lat - 0.004, lng + 0.002],
            [lat + 0.012, lng + 0.005],
            [lat + 0.010, lng + 0.022],
            [lat - 0.006, lng + 0.018]
          ]
        },
        {
          id: 'seg-sol-3',
          label: 'Desert Desert Wash Conservation Buffer',
          confidence: 0.92,
          color: '#84cc16',
          areaKm2: 3.75,
          points: [
            [lat + 0.012, lng - 0.022],
            [lat + 0.018, lng + 0.010],
            [lat + 0.014, lng + 0.024],
            [lat + 0.008, lng - 0.015]
          ]
        }
      ];
      metrics = { mIoU: 0.912, precision: 0.94, recall: 0.92, f1Score: 0.93 };
      summary = `Segmented 11.05 km² of high-albedo solar mirror arrays and adjacent desert biological conservation buffers with 91.2% mIoU.`;
    } else {
      segmentations = [
        {
          id: 'seg-def-1',
          label: 'Core Spatial Footprint',
          confidence: 0.92,
          color: '#10b981',
          areaKm2: 4.5,
          points: [
            [lat - dLat * 0.4, lng - dLng * 0.4],
            [lat + dLat * 0.4, lng - dLng * 0.3],
            [lat + dLat * 0.3, lng + dLng * 0.4],
            [lat - dLat * 0.3, lng + dLng * 0.3]
          ]
        }
      ];
      metrics = { mIoU: 0.85, precision: 0.88, recall: 0.87, f1Score: 0.875 };
      summary = `Extracted feature polygons across the selected AOI using fine-tuned segmentation backbones.`;
    }
  } else if (task === 'landcover') {
    landCover = [
      { code: 50, name: 'Built-up / Urban Fabric', color: '#fa0000', percentage: 38.4, areaKm2: Number((preset.stats.areaKm2 * 0.384).toFixed(1)) },
      { code: 80, name: 'Water Bodies', color: '#0064c8', percentage: 29.2, areaKm2: Number((preset.stats.areaKm2 * 0.292).toFixed(1)) },
      { code: 10, name: 'Tree Canopy & Parkland', color: '#006400', percentage: 14.6, areaKm2: Number((preset.stats.areaKm2 * 0.146).toFixed(1)) },
      { code: 30, name: 'Grassland & Turf', color: '#ffff4c', percentage: 11.3, areaKm2: Number((preset.stats.areaKm2 * 0.113).toFixed(1)) },
      { code: 60, name: 'Bare Soil & Mineral Surface', color: '#b4b4b4', percentage: 6.5, areaKm2: Number((preset.stats.areaKm2 * 0.065).toFixed(1)) }
    ];
    metrics = { mIoU: 0.867, precision: 0.89, recall: 0.88, f1Score: 0.885 };
    summary = `ESA WorldCover 10m Land Cover classification completed. Predominant classes: Built-up infrastructure (${landCover[0].percentage}%), Water surface (${landCover[1].percentage}%), and Tree canopy (${landCover[2].percentage}%). Overall accuracy: 88.5%.`;
  } else if (task === 'change_detection') {
    segmentations = [
      {
        id: 'cd-loss-1',
        label: 'Primary Forest Canopy Loss (2020 - 2024)',
        confidence: 0.94,
        color: '#ef4444',
        areaKm2: 34.8,
        points: [
          [lat - 0.035, lng - 0.040],
          [lat - 0.010, lng - 0.035],
          [lat - 0.015, lng + 0.010],
          [lat - 0.040, lng + 0.005]
        ]
      },
      {
        id: 'cd-loss-2',
        label: 'New Feeder Road & Logging Spur Corridors',
        confidence: 0.91,
        color: '#f97316',
        areaKm2: 8.4,
        points: [
          [lat + 0.005, lng - 0.030],
          [lat + 0.025, lng - 0.015],
          [lat + 0.020, lng + 0.020],
          [lat + 0.000, lng + 0.010]
        ]
      },
      {
        id: 'cd-stable',
        label: 'Intact Primary Rainforest Reserve',
        confidence: 0.98,
        color: '#15803d',
        areaKm2: 122.0,
        points: [
          [lat + 0.025, lng - 0.045],
          [lat + 0.055, lng - 0.030],
          [lat + 0.050, lng + 0.035],
          [lat + 0.020, lng + 0.025]
        ]
      }
    ];
    metrics = { mIoU: 0.832, precision: 0.87, recall: 0.89, f1Score: 0.88 };
    summary = `ChangeStar bi-temporal Siamese network analyzed Sentinel-2 / Landsat acquisitions. Detected 34.8 km² net forest loss and 8.4 km² new logging corridors between 2020 and 2024. Intact forest retention: 65.9%.`;
  } else if (task === 'canopy') {
    metrics = { meanCanopyHeightMeters: 28.4, mIoU: 0.841, precision: 0.89 };
    segmentations = [
      {
        id: 'canopy-tall',
        label: 'Old-Growth Conifer / Hardwood (> 35m)',
        confidence: 0.95,
        color: '#064e3b',
        areaKm2: 18.2,
        points: [
          [lat - 0.018, lng - 0.025],
          [lat + 0.005, lng - 0.020],
          [lat + 0.002, lng - 0.005],
          [lat - 0.015, lng - 0.010]
        ]
      },
      {
        id: 'canopy-mid',
        label: 'Regenerating Sub-Canopy (15 - 35m)',
        confidence: 0.91,
        color: '#10b981',
        areaKm2: 14.6,
        points: [
          [lat + 0.005, lng - 0.010],
          [lat + 0.020, lng - 0.005],
          [lat + 0.015, lng + 0.018],
          [lat + 0.000, lng + 0.012]
        ]
      },
      {
        id: 'canopy-low',
        label: 'Pioneer Shrubs & Mineral Crater (< 5m)',
        confidence: 0.93,
        color: '#a3e635',
        areaKm2: 19.2,
        points: [
          [lat - 0.025, lng + 0.005],
          [lat - 0.005, lng + 0.010],
          [lat - 0.010, lng + 0.028],
          [lat - 0.030, lng + 0.022]
        ]
      }
    ];
    summary = `ETH Global Canopy Height Model (10m) computed pixel-wise forest canopy elevations. Mean canopy height across the AOI is 28.4m, with mature stands reaching 42m and post-disturbance pioneer regrowth at 3.2m.`;
  } else {
    // Foundation models (Prithvi / UniverSat)
    metrics = { mIoU: 0.895, precision: 0.93, recall: 0.91, f1Score: 0.92 };
    summary = `Prithvi-100M geospatial foundation model extracted multi-spectral embeddings across 6 HLS bands (Blue, Green, Red, Narrow NIR, SWIR-1, SWIR-2). Latent vectors clustered into distinct physical land surface regimes with high thematic separation.`;
  }

  const pythonCode = generatePythonScript(preset, task, modelId);

  return {
    taskId: task,
    modelId,
    executionTimeMs: Math.floor(650 + Math.random() * 450),
    timestamp: new Date().toISOString(),
    presetId: preset.id,
    summary,
    detections,
    segmentations,
    landCover,
    metrics,
    pythonCode
  };
}

export function generatePythonScript(preset: GeoPreset, task: GeoTask, modelId: string): string {
  const [lat, lng] = preset.center;
  const bboxStr = `[${preset.bounds[0][1].toFixed(4)}, ${preset.bounds[0][0].toFixed(4)}, ${preset.bounds[1][1].toFixed(4)}, ${preset.bounds[1][0].toFixed(4)}]`;

  switch (task) {
    case 'detection':
      return `"""
GeoAI Object Detection Pipeline
Repository: https://github.com/opengeos/geoai
Dataset: ${preset.name} (${preset.satelliteSource})
"""
import geoai
from geoai import multiclass_detection, download_imagery

# 1. Define Area of Interest (AOI) bounding box [min_lon, min_lat, max_lon, max_lat]
bbox = ${bboxStr}

# 2. Acquire remote sensing imagery
image_path = "data/${preset.id}.tif"
print(f"Acquiring high-resolution imagery for AOI: {bbox}...")
download_imagery(
    bbox=bbox,
    source="sentinel2",
    output_path=image_path,
    bands=["B02", "B03", "B04", "B08"],
    max_cloud_cover=${preset.stats.clouds + 2}
)

# 3. Run RF-DETR object detection inference
print("Running GeoAI Multiclass Detector (RF-DETR)...")
results = multiclass_detection(
    image=image_path,
    model_name="${modelId}",
    confidence_threshold=0.50,
    nms_threshold=0.45,
    chip_size=512,
    chip_overlap=64,
    device="cuda" if geoai.is_gpu_available() else "cpu"
)

# 4. Convert detected bounding boxes into GeoPandas GeoDataFrame
gdf = geoai.detections_to_geodataframe(results, crs="EPSG:4326")
print(f"Detected {len(gdf)} objects.")
gdf.to_file("outputs/${preset.id}_detections.geojson", driver="GeoJSON")

# 5. Interactive visualization with Leafmap
m = geoai.view_detections(gdf, base_layer="${preset.satelliteSource}")
m.save("outputs/detection_map.html")
print("Saved interactive visualization to outputs/detection_map.html")`;

    case 'segmentation':
      return `"""
GeoAI Semantic Segmentation Pipeline with SAM-Geospatial
Repository: https://github.com/opengeos/geoai
Target: ${preset.name}
"""
import geoai
from geoai import semantic_segmentation, download_imagery

bbox = ${bboxStr}
image_path = "data/${preset.id}.tif"

# 1. Download imagery
download_imagery(bbox=bbox, source="naip", output_path=image_path)

# 2. Run promptable or automatic segmentation
print("Initializing Segment Anything (SAM) remote sensing pipeline...")
masks = semantic_segmentation(
    image=image_path,
    model_type="vit_h",
    checkpoint="sam_vit_h_4b8939.pth",
    points_per_side=32,
    pred_iou_thresh=0.88,
    stability_score_thresh=0.92,
    crop_n_layers=1,
    crop_n_points_downscale_factor=2,
    min_mask_region_area=100
)

# 3. Export polygons to GeoPackage / Shapefile
output_vector = "outputs/${preset.id}_segments.gpkg"
geoai.masks_to_vector(masks, image_path, output_vector, simplify_tolerance=0.5)
print(f"Exported segmented polygons to {output_vector}")`;

    case 'landcover':
      return `"""
GeoAI Land Cover Classification Pipeline (ESA WorldCover 10m)
Repository: https://github.com/opengeos/geoai
"""
import geoai
from geoai import landcover_classify, plot_landcover_distribution

bbox = ${bboxStr}
image_path = "data/${preset.id}_s2.tif"

# 1. Download Sentinel-2 multi-spectral L2A cube
download_imagery(bbox=bbox, source="sentinel2_l2a", output_path=image_path)

# 2. Run pixel-wise land cover inference
classification_raster = "outputs/${preset.id}_lulc_10m.tif"
landcover_classify(
    image_path=image_path,
    output_path=classification_raster,
    model="${modelId}",
    num_classes=10,
    batch_size=16,
    device="cuda"
)

# 3. Compute class area statistics
stats = geoai.calculate_landcover_stats(classification_raster)
print("Land Cover Distribution:")
for class_name, pct in stats.items():
    print(f"  {class_name}: {pct:.2f}%")

# 4. Generate thematic map
plot_landcover_distribution(classification_raster, output_png="outputs/lulc_chart.png")`;

    case 'change_detection':
      return `"""
GeoAI Bi-Temporal Change Detection Pipeline (ChangeStar)
Repository: https://github.com/opengeos/geoai
"""
import geoai
from geoai import changestar_detect

bbox = ${bboxStr}
t1_image = "data/${preset.id}_2020.tif"
t2_image = "data/${preset.id}_2024.tif"

# 1. Download multi-temporal Sentinel-2 imagery
geoai.download_temporal_pair(bbox=bbox, date_t1="2020-08-01", date_t2="2024-08-01", out_t1=t1_image, out_t2=t2_image)

# 2. Run ChangeStar Siamese difference inference
change_map = "outputs/${preset.id}_change.tif"
changestar_detect(
    t1_path=t1_image,
    t2_path=t2_image,
    output_path=change_map,
    model_name="${modelId}",
    threshold=0.60
)

# 3. Vectorize verified change hotspots
change_polygons = geoai.raster_to_vector(change_map, min_area_m2=500)
change_polygons.to_file("outputs/forest_loss_polygons.geojson", driver="GeoJSON")
print("Bi-temporal change analysis complete.")`;

    case 'canopy':
      return `"""
GeoAI Global Canopy Height Estimation (10m GEDI-Calibrated)
Repository: https://github.com/opengeos/geoai
"""
import geoai
from geoai import canopy_height_estimation

bbox = ${bboxStr}
s2_tile = "data/${preset.id}_s2_bands.tif"
output_canopy = "outputs/${preset.id}_canopy_height.tif"

# Run 10m canopy height estimation
canopy_height_estimation(
    input_raster=s2_tile,
    output_raster=output_canopy,
    model_name="${modelId}",
    batch_size=8
)

# Calculate summary height metrics
stats = geoai.raster_stats(output_canopy)
print(f"Mean Canopy Height: {stats['mean']:.1f} meters")
print(f"Max Canopy Height: {stats['max']:.1f} meters")`;

    case 'foundation':
    default:
      return `"""
GeoAI Foundation Model Embeddings with Prithvi-100M
Repository: https://github.com/opengeos/geoai
"""
import geoai
from geoai.prithvi import PrithviProcessor, load_prithvi_model

bbox = ${bboxStr}
hls_cube = "data/${preset.id}_hls.tif"

# 1. Load Prithvi foundation model weights
print("Loading Prithvi-100M NASA/IBM backbone...")
model = load_prithvi_model(checkpoint="Prithvi_100M.pt")
processor = PrithviProcessor()

# 2. Extract deep geospatial embeddings
features = processor.extract_patch_embeddings(
    input_cube=hls_cube,
    patch_size=16,
    temporal_steps=3
)
print(f"Extracted embedding tensor: {features.shape}")

# 3. Zero-shot clustering & PCA visualization
pca_rgb = geoai.universat.get_pca_rgb(features)
geoai.save_raster(pca_rgb, "outputs/prithvi_pca_decomposition.tif")
print("Generated false-color PCA feature map.")`;
  }
}
