# digital-catalog

**Interactive virtual showroom + product catalog.** Customers walk through a 360° panorama of the showroom, click hotspots on real products to open the catalog entry, and export a quote PDF — without leaving the page.

Built for industrial manufacturers (originally codename "fabrikaa") who used to demo their catalog as a stack of PDFs and lose attention by page 3.

## What it does

- **360° showroom tour** powered by [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/). Multiple linked rooms, each room a separate panorama, with virtual-tour navigation between them.
- **Product hotspots** — markers on the panorama open a side panel with the product spec, photo, and CTA.
- **Catalog browser** — flat list view for users who skip the tour.
- **Quote builder + PDF export** via jsPDF + jsPDF-AutoTable.
- **Admin-editable content** through the Express + MongoDB backend.

## Tech Stack

**Frontend** React 19 · Vite 7 · React Router 7 · Framer Motion · Lucide icons · Photo Sphere Viewer (core + markers + virtual-tour plugins) · jsPDF + jspdf-autotable

**Backend (`server/`)** Node + Express · Mongoose (MongoDB) · middleware-based auth · REST routes for products / rooms / quotes

**Image pipeline** Sharp for panorama processing

**Infra** Dockerfile + docker-compose + nginx reverse proxy

## Quick start

```bash
git clone https://github.com/sucreistaken/digital-catalog.git
cd digital-catalog

# Frontend
npm install
npm run dev            # vite :5173

# Backend (separate terminal)
cd server
cp .env.example .env   # fill MONGODB_URI, JWT_SECRET, etc.
npm install
npm start              # api :4000
```

Or the all-in-one Docker route:

```bash
docker compose up -d
# nginx serves the built frontend on :80 and proxies /api to the backend
```

## Project structure

```
src/
  pages/         Showroom (panorama), catalog, product detail, quote builder
  components/    PanoramaViewer wrapper, ProductCard, QuoteCart, etc.
  context/       Cart + selected-product state
  data/          Static product/room seed data (for demo / no-backend mode)
  utils/         PDF generation helpers
server/
  routes/        /api/products, /api/rooms, /api/quotes
  models/        Mongoose schemas
  middleware/    auth, validation
public/
  panoramas/     Source 360° images
```

## Notes

The showroom expects equirectangular panoramas (2:1 aspect, ideally 8000×4000+). Hotspots are positioned by yaw/pitch in `src/data/` or via the admin panel.

## Status

MVP shipped; in iteration with the launch customer. Roadmap: WebXR mode for VR headsets, automatic panorama stitching from phone-captured 360s.
