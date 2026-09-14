# 🌍 SIH-Land: GeoAI Studio

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900.svg)](https://leafletjs.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Pro-4285F4.svg)](https://ai.google.dev/)

An advanced **Geospatial AI & Land Cover Intelligence Workbench** built for the **Smart India Hackathon (SIH)**. Designed for satellite imagery analysis, automated cadastral mapping, land encroachment detection, foundation model inference, and AI-assisted geospatial workflows.

---

## 🚀 Key Features

### 1. 🛰️ Multi-Source Geospatial Map Viewer
- High-resolution interactive satellite viewer powered by Leaflet.
- Layer toggling between **ISRO Bhuvan (LISS-IV / Cartosat)**, **Sentinel-2 multispectral**, **OpenStreetMap**, **CartoDB Voyager**, and **ESRI World Imagery**.
- Custom ROI (Region of Interest) drawing, distance measuring, split-screen temporal before/after sliders, and spectral band combinations (NDVI, NDWI, False Color Composite).

### 2. 🤖 Geospatial Foundation Models & Model Zoo
- **NASA / IBM Prithvi-100M**: Temporal multi-spectral Earth observation foundation model for land cover and flood mapping.
- **Meta SAM (Segment Anything Model)**: Zero-shot promptable polygon segmentation for parcels, water bodies, and structures.
- **RF-DETR (Real-Time Detection Transformer)**: Rapid aerial object detection (vehicles, industrial storage, illegal infrastructure).
- **Clay / SatMAE**: Multi-modal self-supervised geospatial backbones.

### 3. 📜 Land Registry & Cadastral Encroachment Detection
- Automated alignment of government revenue maps (khasra / survey numbers) over live satellite imagery.
- Boundary violation detection with flagged encroachment severity scores and buffer-zone calculations.
- Discrepancy reporting between registered deeds and physical land use.

### 4. 🧠 GeoAgent AI Assistant (Gemini 2.5)
- Interactive conversational GeoAI agent to query land classification, run automated reports, calculate vegetation indices, and diagnose anomalies.
- Natural language to geospatial code generation (Earth Engine, STAC API, PyTorch GeoTIFF processing).

### 5. 💻 Live Code Generator & Data Export
- Instant reproducible Python/PyTorch inference scripts for local training and execution.
- GeoJSON, Shapefile, and COG (Cloud Optimized GeoTIFF) chip exports for GIS software (QGIS, ArcGIS).

---

## 📂 Project Structure

```
sih-land/
├── src/
│   ├── components/
│   │   ├── MapViewer.tsx           # Leaflet interactive map with layers & overlays
│   │   ├── LandRegistryPanel.tsx   # Cadastral records, parcel checks, encroachment alerts
│   │   ├── TaskControlPanel.tsx    # Model selector, inference parameters, task trigger
│   │   ├── GeoAgentChat.tsx        # Gemini-powered GeoAI conversational assistant
│   │   ├── ModelZooModal.tsx       # Foundation model directory & specifications
│   │   ├── ChipInspectorModal.tsx  # Multi-spectral band inspector & spectral curves
│   │   ├── CodeModal.tsx           # Python/PyTorch & STAC API code generator
│   │   ├── DownloadModal.tsx       # GeoJSON, GeoTIFF, and report export dialog
│   │   └── Navbar.tsx              # Application header, layer presets, status badges
│   ├── data/                       # Preset regions, sample cadastral records, model metadata
│   ├── utils/                      # Geospatial math, polygon calculations, color legends
│   ├── types.ts                    # Core TypeScript definitions
│   ├── App.tsx                     # Main layout & orchestrator
│   └── main.tsx                    # React application entry point
├── server.ts                       # Express backend proxy for Gemini API and STAC APIs
├── metadata.json                   # Applet metadata and capabilities
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript compiler configuration
└── vite.config.ts                  # Vite bundler configuration
```

---

## 🛠️ Quick Start

### Prerequisites
- Node.js (v18 or v20+)
- npm, pnpm, or bun

### 1. Clone the Repository
```bash
git clone https://github.com/KK1617/sih-land.git
cd sih-land
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the sample environment file:
```bash
cp .env.example .env
```
Provide your Google Gemini API key:
```env
GEMINI_API_KEY="your_api_key_here"
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.

## 📄 License
This project is licensed under the MIT License.
