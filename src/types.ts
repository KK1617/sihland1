export type GeoTask = 
  | 'segmentation' 
  | 'detection' 
  | 'landcover' 
  | 'foundation' 
  | 'change_detection' 
  | 'canopy';

export type MapLayerType = 'satellite' | 'bhuvan' | 'osm' | 'voyager' | 'topo' | 'dark';

export interface GeoPreset {
  id: string;
  name: string;
  location: string;
  category: string;
  center: [number, number];
  zoom: number;
  description: string;
  defaultTask: GeoTask;
  satelliteSource: string;
  resolution: string;
  acquisitionDate: string;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  stats: {
    areaKm2: number;
    clouds: number;
    sensor: string;
  };
}

export interface GeoModel {
  id: string;
  name: string;
  category: GeoTask;
  framework: string;
  parameterCount: string;
  weightsSize: string;
  license: string;
  huggingfaceUrl?: string;
  paperUrl?: string;
  description: string;
  supportedBackbones: string[];
}

export interface DetectionBox {
  id: string;
  label: string;
  confidence: number;
  bounds: [[number, number], [number, number]]; // [[lat1, lng1], [lat2, lng2]]
  attributes?: Record<string, string | number>;
}

export interface SegmentationPolygon {
  id: string;
  label: string;
  confidence: number;
  color: string;
  areaKm2: number;
  points: [number, number][]; // lat, lng points
}

export interface LandCoverDistribution {
  code: number;
  name: string;
  color: string;
  percentage: number;
  areaKm2: number;
}

export interface InferenceResult {
  taskId: GeoTask;
  modelId: string;
  executionTimeMs: number;
  timestamp: string;
  presetId: string;
  summary: string;
  detections: DetectionBox[];
  segmentations: SegmentationPolygon[];
  landCover: LandCoverDistribution[];
  metrics: {
    mIoU?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    meanCanopyHeightMeters?: number;
    detectedCount?: number;
  };
  pythonCode: string;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  code?: string;
  suggestedAction?: {
    task?: GeoTask;
    presetId?: string;
    modelId?: string;
  };
}

export interface ChipExportConfig {
  chipSize: number; // 256, 512, 1024
  stride: number;
  bands: string[]; // ['B02', 'B03', 'B04', 'B08']
  format: 'GeoTIFF' | 'PNG' | 'Numpy';
  exportLabels: boolean;
}

export type LandType = 
  | 'agricultural' 
  | 'commercial' 
  | 'residential' 
  | 'industrial' 
  | 'forest' 
  | 'government';

export interface LandEntry {
  id: string;
  surveyNumber: string; // e.g. "Khasra No. 104/1" or "Survey 82"
  ownerName: string;
  state: string; // Indian State, e.g. Punjab, Maharashtra
  district: string;
  landType: LandType;
  coordinates: [number, number][]; // Array of [lat, lng] vertices
  areaHectares: number;
  areaAcres: number;
  areaSqMeters: number;
  registeredAt: string;
  color: string;
  notes?: string;
}

export interface OverlapConflict {
  id: string;
  parcelId1: string;
  parcelId2: string;
  surveyNumber1: string;
  surveyNumber2: string;
  owner1: string;
  owner2: string;
  description: string;
  overlapSeverity: 'high' | 'medium' | 'contained';
}

