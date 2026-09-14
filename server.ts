import express from 'express';
import path from 'path';
import { execFile } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { GEO_PRESETS, GEO_MODELS, generateInferenceResult } from './src/data/geoData.ts';
import { GeoTask } from './src/types.ts';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // 1. Health check & GeoAI ecosystem metadata
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      package: 'geoai',
      name: 'GeoAI: Artificial Intelligence for Geospatial Data',
      author: 'Qiusheng Wu & OpenGeos Community',
      repo: 'https://github.com/opengeos/geoai',
      bookUrl: 'https://book.opengeoai.org',
      docsUrl: 'https://opengeoai.org',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      version: '0.4.0'
    });
  });

  // 2. Presets API
  app.get('/api/geoai/presets', (_req, res) => {
    res.json(GEO_PRESETS);
  });

  // 3. Models API
  app.get('/api/geoai/models', (_req, res) => {
    res.json(GEO_MODELS);
  });

  // Download complete project source code as a ZIP
  app.get('/api/download-zip', (_req, res) => {
    const zipPath = path.join('/tmp', 'geoai-studio.zip');
    execFile('python3', ['export_zip.py', '.', zipPath], (error) => {
      if (error) {
        console.error('Failed to create zip:', error);
        return res.status(500).json({ error: 'Failed to generate project ZIP' });
      }
      res.download(zipPath, 'geoai-studio.zip', (err) => {
        if (err && !res.headersSent) {
          console.error('Download stream error:', err);
          res.status(500).json({ error: 'Failed to download zip' });
        }
      });
    });
  });

  // 4. Run Inference API
  app.post('/api/geoai/run', (req, res) => {
    try {
      const { presetId, taskId, modelId } = req.body;
      const preset = GEO_PRESETS.find(p => p.id === presetId) || GEO_PRESETS[0];
      const validTask: GeoTask = (taskId as GeoTask) || preset.defaultTask;
      const activeModelId = modelId || 'rf-detr-satellite';

      const result = generateInferenceResult(preset, validTask, activeModelId);
      res.json(result);
    } catch (err) {
      console.error('Inference error:', err);
      res.status(500).json({ error: 'Failed to execute GeoAI inference workflow' });
    }
  });

  // 5. Geospatial AI Multimodal Reasoning Agent
  app.post('/api/geoai/agent', async (req, res) => {
    const { prompt, presetId, taskId, currentMetrics } = req.body;
    const preset = GEO_PRESETS.find(p => p.id === presetId) || GEO_PRESETS[0];

    // Fallback expert response if Gemini API key is missing or encounters issues
    const generateFallback = (userPrompt: string) => {
      const q = userPrompt.toLowerCase();
      if (q.includes('code') || q.includes('python') || q.includes('script') || q.includes('api')) {
        return {
          content: `Here is a complete Python script to execute this analysis using the **geoai** package directly on your local machine or Google Colab with GPU acceleration:`,
          code: `import geoai\nfrom geoai import multiclass_detection, semantic_segmentation, download_imagery\n\n# Bounding box for ${preset.name}\nbbox = [${preset.bounds[0][1]}, ${preset.bounds[0][0]}, ${preset.bounds[1][1]}, ${preset.bounds[1][0]}]\n\n# 1. Download imagery\nimg_path = "imagery_${preset.id}.tif"\ndownload_imagery(bbox=bbox, source="${preset.stats.sensor.includes('NAIP') ? 'naip' : 'sentinel2'}", output_path=img_path)\n\n# 2. Run inference\nprint("Executing GeoAI model pipeline...")\nresults = multiclass_detection(image=img_path, model_name="rf-detr-satellite", confidence_threshold=0.5)\n\n# 3. Export to GeoJSON\ngdf = geoai.detections_to_geodataframe(results)\ngdf.to_file("detections.geojson", driver="GeoJSON")\nprint(f"Detected {len(gdf)} features with high confidence.")`
        };
      }
      if (q.includes('change') || q.includes('deforestation') || q.includes('trend')) {
        return {
          content: `**Geospatial Change Detection Analysis for ${preset.name}:**\n\n- **Sensor Source**: ${preset.satelliteSource}\n- **Spectral Indices**: Evaluated NDVI (Normalized Difference Vegetation Index = (NIR - Red)/(NIR + Red)) and NDBI (Normalized Difference Built-up Index).\n- **Observed Dynamic**: Spectral variance between historical and recent passes indicates distinct surface modifications, with key localized clusters in the perimeter boundary.\n- **Recommended Workflow**: Use \`geoai.changestar_detect\` with a bi-temporal Sentinel-2 pair to vectorize verified surface modifications while filtering seasonal phenological shifts.`,
          code: `from geoai import changestar_detect\n\n# Run ChangeStar Siamese detection\nchangestar_detect(\n    t1_path="archive_2020.tif",\n    t2_path="current_2024.tif",\n    output_path="change_mask.tif",\n    threshold=0.6\n)`
        };
      }
      return {
        content: `**GeoAI Analysis for ${preset.name} (${preset.location})**\n\n- **Target Category**: ${preset.category}\n- **Resolution & Sensor**: ${preset.resolution} via ${preset.satelliteSource}\n- **Surface Characteristics**: Coverage area encompasses ${preset.stats.areaKm2} km² with approximately ${preset.stats.clouds}% cloud interference.\n- **Recommended Pipeline**: For this terrain and surface composition, the **${taskId === 'detection' ? 'RF-DETR Satellite Detector' : taskId === 'segmentation' ? 'SAM-Geospatial (Segment Anything)' : 'ESA WorldCover 10m UNet'}** yields optimal boundary fidelity and feature classification.`,
        code: `import geoai\n# Load pre-trained weights for ${taskId}\nmodel = geoai.load_model("${taskId === 'detection' ? 'rf-detr-satellite' : 'sam-geospatial'}")\nprint(f"Model ready on device: {geoai.get_device()}")`
      };
    };

    try {
      const ai = getAI();
      if (!ai) {
        return res.json(generateFallback(prompt || ''));
      }

      const systemInstruction = `You are GeoAI Agent, an expert geospatial AI scientist and remote sensing specialist for the OpenGeos GeoAI package (https://github.com/opengeos/geoai, by Qiusheng Wu).
You specialize in satellite imagery processing (Sentinel-2, Landsat-8/9, NAIP, Maxar, Planet), deep learning architectures for earth observation (Prithvi, SAM-Geospatial, RF-DETR, ChangeStar, ETH Canopy Height, ESA WorldCover), and spectral band algebra (NDVI, NDWI, NDBI).
Always provide rigorous, technically precise answers. When asked for code, provide clean, executable Python scripts utilizing 'import geoai'.
Current context:
- Location: ${preset.name} (${preset.location})
- Coordinates: Lat ${preset.center[0]}, Lng ${preset.center[1]}
- Sensor/Resolution: ${preset.satelliteSource} (${preset.resolution})
- Current Task: ${taskId}
- Active Metrics: ${JSON.stringify(currentMetrics || {})}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt || `Analyze the satellite imagery characteristics and recommend an AI workflow for ${preset.name}`,
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      const responseText = response.text || '';
      return res.json({
        content: responseText,
        code: undefined
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local expert system:', err?.message || err);
      return res.json(generateFallback(prompt || ''));
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GeoAI Studio Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
