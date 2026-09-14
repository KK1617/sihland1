import { LandEntry, OverlapConflict } from '../types';

/**
 * Parses user coordinate text in a wide variety of formats:
 * - Line separated lat, lng pairs:
 *   30.9010, 75.8573
 *   30.9030, 75.8590
 * - Semicolon or comma separated:
 *   30.9010, 75.8573; 30.9030, 75.8590; 30.9020, 75.8610
 * - Array of arrays:
 *   [[30.901, 75.857], [30.903, 75.859], ...]
 * - GeoJSON format:
 *   {"type": "Polygon", "coordinates": [[[75.857, 30.901], ...]]}
 */
export function parseCoordinatesInput(rawText: string): {
  valid: boolean;
  points: [number, number][];
  error?: string;
} {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { valid: false, points: [], error: 'Please enter at least 3 coordinates.' };
  }

  // 1. Check if it's GeoJSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.type === 'Feature' && parsed.geometry?.coordinates) {
        return parseGeoJsonCoords(parsed.geometry.coordinates);
      }
      if (parsed.type === 'Polygon' && parsed.coordinates) {
        return parseGeoJsonCoords(parsed.coordinates);
      }
    } catch {
      // Continue to next parsers
    }
  }

  // 2. Check if it's JSON array format: [[lat, lng], [lat, lng]]
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        const points: [number, number][] = [];
        for (const item of parsed) {
          if (Array.isArray(item) && item.length >= 2) {
            const lat = Number(item[0]);
            const lng = Number(item[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
              points.push([lat, lng]);
            }
          }
        }
        if (points.length >= 3) {
          return validatePoints(points);
        }
      }
    } catch {
      // Continue to text splitting
    }
  }

  // 3. Line or semicolon split
  const rawPairs = trimmed.split(/[\n;]+/).map(s => s.trim()).filter(Boolean);
  const points: [number, number][] = [];

  for (const pair of rawPairs) {
    // Clean brackets or parentheses
    const cleaned = pair.replace(/[\[\]()]/g, '').trim();
    const parts = cleaned.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        points.push([lat, lng]);
      }
    }
  }

  if (points.length < 3) {
    return {
      valid: false,
      points,
      error: `Found only ${points.length} coordinate pair(s). At least 3 points are required to define a land polygon.`
    };
  }

  return validatePoints(points);
}

function parseGeoJsonCoords(coords: any): { valid: boolean; points: [number, number][]; error?: string } {
  const ring = Array.isArray(coords[0]) ? coords[0] : coords;
  const points: [number, number][] = [];
  for (const pt of ring) {
    // GeoJSON is [longitude, latitude]
    if (Array.isArray(pt) && pt.length >= 2) {
      points.push([Number(pt[1]), Number(pt[0])]);
    }
  }
  return validatePoints(points);
}

function validatePoints(points: [number, number][]): { valid: boolean; points: [number, number][]; error?: string } {
  // Remove closing point if identical to first
  const pts = [...points];
  if (
    pts.length > 3 &&
    pts[0][0] === pts[pts.length - 1][0] &&
    pts[0][1] === pts[pts.length - 1][1]
  ) {
    pts.pop();
  }

  if (pts.length < 3) {
    return {
      valid: false,
      points: pts,
      error: 'At least 3 distinct vertices are required to form a closed land parcel.'
    };
  }

  for (let i = 0; i < pts.length; i++) {
    const [lat, lng] = pts[i];
    if (lat < -90 || lat > 90) {
      return { valid: false, points: pts, error: `Invalid latitude ${lat} at vertex #${i + 1}. Must be between -90 and 90.` };
    }
    if (lng < -180 || lng > 180) {
      return { valid: false, points: pts, error: `Invalid longitude ${lng} at vertex #${i + 1}. Must be between -180 and 180.` };
    }
  }

  return { valid: true, points: pts };
}

/**
 * Calculates accurate geodesic/spherical surface area of a polygon in Square Meters.
 * Follows the spherical excess formulation (WGS-84 radius: 6,378,137m).
 */
export function calculatePolygonArea(coords: [number, number][]): {
  sqMeters: number;
  hectares: number;
  acres: number;
} {
  if (coords.length < 3) {
    return { sqMeters: 0, hectares: 0, acres: 0 };
  }

  const R = 6378137; // Earth's mean radius in meters
  let total = 0;
  const n = coords.length;

  for (let i = 0; i < n; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % n];

    const lat1 = (p1[0] * Math.PI) / 180;
    const lat2 = (p2[0] * Math.PI) / 180;
    const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;

    total += dLng * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  const sqMeters = Math.abs((total * R * R) / 2);
  const hectares = sqMeters / 10000;
  const acres = sqMeters / 4046.856422;

  return {
    sqMeters: Math.round(sqMeters * 10) / 10,
    hectares: Math.round(hectares * 1000) / 1000,
    acres: Math.round(acres * 1000) / 1000,
  };
}

/**
 * Computes bounding box for fast pre-filtering.
 */
export function getBoundingBox(coords: [number, number][]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of coords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return { minLat, maxLat, minLng, maxLng };
}

function doBoxesOverlap(
  a: ReturnType<typeof getBoundingBox>,
  b: ReturnType<typeof getBoundingBox>
): boolean {
  return !(
    a.maxLat < b.minLat ||
    a.minLat > b.maxLat ||
    a.maxLng < b.minLng ||
    a.minLng > b.maxLng
  );
}

/**
 * 2D Orientation / Counter-Clockwise test
 */
function ccw(p1: [number, number], p2: [number, number], p3: [number, number]): number {
  return (p3[0] - p1[0]) * (p2[1] - p1[1]) - (p2[0] - p1[0]) * (p3[1] - p1[1]);
}

function onSegment(
  p: [number, number],
  q: [number, number],
  r: [number, number]
): boolean {
  return (
    q[0] <= Math.max(p[0], r[0]) &&
    q[0] >= Math.min(p[0], r[0]) &&
    q[1] <= Math.max(p[1], r[1]) &&
    q[1] >= Math.min(p[1], r[1])
  );
}

/**
 * Checks whether line segment (p1 -> p2) intersects line segment (q1 -> q2)
 */
export function segmentsIntersect(
  p1: [number, number],
  p2: [number, number],
  q1: [number, number],
  q2: [number, number]
): boolean {
  // Shared identical endpoint check (polygons sharing single vertex or consecutive edge endpoint)
  const eps = 1e-9;
  const isClose = (a: [number, number], b: [number, number]) =>
    Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps;

  if (isClose(p1, q1) || isClose(p1, q2) || isClose(p2, q1) || isClose(p2, q2)) {
    return false;
  }

  const o1 = Math.sign(ccw(p1, p2, q1));
  const o2 = Math.sign(ccw(p1, p2, q2));
  const o3 = Math.sign(ccw(q1, q2, p1));
  const o4 = Math.sign(ccw(q1, q2, p2));

  // General intersection case
  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  // Special Collinear Cases
  if (o1 === 0 && onSegment(p1, q1, p2)) return true;
  if (o2 === 0 && onSegment(p1, q2, p2)) return true;
  if (o3 === 0 && onSegment(q1, p1, q2)) return true;
  if (o4 === 0 && onSegment(q1, p2, q2)) return true;

  return false;
}

/**
 * Point-in-polygon Ray Casting algorithm
 */
export function isPointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  const y = point[0]; // Lat
  const x = point[1]; // Lng
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const yi = polygon[i][0];
    const xi = polygon[i][1];
    const yj = polygon[j][0];
    const xj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Determines whether two 2D polygons intersect or overlap.
 * Returns true if edges cross OR if one polygon is enclosed within the other.
 */
export function checkPolygonIntersection(
  polyA: [number, number][],
  polyB: [number, number][]
): {
  intersects: boolean;
  type?: 'edge_crossing' | 'contained' | 'identical';
} {
  if (polyA.length < 3 || polyB.length < 3) {
    return { intersects: false };
  }

  // 1. Fast bounding box rejection
  const bboxA = getBoundingBox(polyA);
  const bboxB = getBoundingBox(polyB);
  if (!doBoxesOverlap(bboxA, bboxB)) {
    return { intersects: false };
  }

  // 2. Check if any edge of A crosses any edge of B
  for (let i = 0; i < polyA.length; i++) {
    const a1 = polyA[i];
    const a2 = polyA[(i + 1) % polyA.length];

    for (let j = 0; j < polyB.length; j++) {
      const b1 = polyB[j];
      const b2 = polyB[(j + 1) % polyB.length];

      if (segmentsIntersect(a1, a2, b1, b2)) {
        return { intersects: true, type: 'edge_crossing' };
      }
    }
  }

  // 3. Check for containment: are any points of A inside B?
  let aInBCount = 0;
  for (const pt of polyA) {
    if (isPointInPolygon(pt, polyB)) {
      aInBCount++;
    }
  }
  if (aInBCount > 0) {
    return { intersects: true, type: 'contained' };
  }

  // 4. Check for reverse containment: are any points of B inside A?
  let bInACount = 0;
  for (const pt of polyB) {
    if (isPointInPolygon(pt, polyA)) {
      bInACount++;
    }
  }
  if (bInACount > 0) {
    return { intersects: true, type: 'contained' };
  }

  return { intersects: false };
}

/**
 * Scans all registered parcels and returns a list of all pairwise overlap conflicts.
 */
export function detectAllCollisions(parcels: LandEntry[]): OverlapConflict[] {
  const conflicts: OverlapConflict[] = [];

  for (let i = 0; i < parcels.length; i++) {
    for (let j = i + 1; j < parcels.length; j++) {
      const p1 = parcels[i];
      const p2 = parcels[j];

      const res = checkPolygonIntersection(p1.coordinates, p2.coordinates);
      if (res.intersects) {
        conflicts.push({
          id: `conflict-${p1.id}-${p2.id}`,
          parcelId1: p1.id,
          parcelId2: p2.id,
          surveyNumber1: p1.surveyNumber,
          surveyNumber2: p2.surveyNumber,
          owner1: p1.ownerName,
          owner2: p2.ownerName,
          description: `Land boundary conflict: "${p1.surveyNumber}" (${p1.ownerName}) intersects with "${p2.surveyNumber}" (${p2.ownerName})!`,
          overlapSeverity: res.type === 'contained' ? 'high' : 'medium',
        });
      }
    }
  }

  return conflicts;
}

/**
 * Checks a candidate polygon (during registration) against existing parcels.
 */
export function checkCandidateOverlap(
  candidateCoords: [number, number][],
  existingParcels: LandEntry[],
  excludeParcelId?: string
): {
  hasConflict: boolean;
  conflictingParcels: LandEntry[];
  warningMessage?: string;
} {
  if (candidateCoords.length < 3) {
    return { hasConflict: false, conflictingParcels: [] };
  }

  const conflicting: LandEntry[] = [];
  for (const parcel of existingParcels) {
    if (excludeParcelId && parcel.id === excludeParcelId) continue;
    const res = checkPolygonIntersection(candidateCoords, parcel.coordinates);
    if (res.intersects) {
      conflicting.push(parcel);
    }
  }

  if (conflicting.length > 0) {
    const names = conflicting.map(p => `"${p.surveyNumber}" (${p.ownerName})`).join(', ');
    return {
      hasConflict: true,
      conflictingParcels: conflicting,
      warningMessage: `⚠️ Collision Warning: Entered coordinates overlap with existing land parcel(s): ${names}!`,
    };
  }

  return { hasConflict: false, conflictingParcels: [] };
}
