# digital-catalog

Interactive virtual showroom and product catalog. Customers walk through a 360 degree panorama of the showroom in their browser, click on real products to see the catalog entry, and build a quote PDF without leaving the page.

Originally built for an industrial manufacturer (project codename "fabrikaa") that wanted to replace stacks of PDF catalogs with something customers actually look at.

## What it does

- **360 degree showroom tour** using Photo Sphere Viewer. Multiple rooms, each one a separate panorama, linked together so the user can walk from one to the next.
- **Clickable product hotspots** placed on the panorama. Clicking one opens a side panel with the product spec, photos, and a button to add it to the quote.
- **Catalog browser** as a flat list for users who skip the tour.
- **Quote builder** that exports a PDF (jsPDF + jspdf-autotable).
- **Admin panel** so the catalog and rooms can be edited without touching code.

## Tech stack

**Frontend** React 19, Vite 7, React Router 7, Framer Motion, Lucide icons, Photo Sphere Viewer (core, markers, virtual-tour plugins), jsPDF.

**Backend (`server/`)** Node, Express, MongoDB with Mongoose. REST routes for products, rooms, and quotes. Authentication middleware.

**Image pipeline** Sharp for panorama processing.

**Infrastructure** Dockerfile, docker-compose, nginx as a reverse proxy.

## Run it

```bash
git clone https://github.com/sucreistaken/digital-catalog.git
cd digital-catalog

# Frontend
npm install
npm run dev                # Vite on :5173

# Backend, in another terminal
cd server
cp .env.example .env       # add MONGODB_URI, JWT_SECRET, etc.
npm install
npm start                  # API on :4000
```

Or run the full stack with Docker:

```bash
docker compose up -d
# nginx serves the built frontend on :80 and proxies /api to the backend
```

## Project layout

```
src/
  pages/         Showroom, catalog, product detail, quote builder
  components/    PanoramaViewer, ProductCard, QuoteCart, etc.
  context/       Cart and selected-product state
  data/          Static product/room data for the demo/no-backend mode
  utils/         PDF generation helpers
server/
  routes/        /api/products, /api/rooms, /api/quotes
  models/        Mongoose schemas
  middleware/    auth, validation
public/
  panoramas/     360 degree images
```

## Notes

Panoramas should be equirectangular (2:1 ratio, 8000x4000 px works well). Hotspot positions are yaw/pitch values stored in `src/data/` or set through the admin panel.

## Status

MVP shipped to the first customer; in iteration. Planned next: WebXR mode for VR headsets, automatic stitching from phone-captured 360 degree images.
