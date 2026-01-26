# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
# Copy root package files
COPY package*.json ./
RUN npm install
# Copy frontend source
COPY . .
# Build React app
RUN npm run build

# Stage 2: Setup Backend & Serve
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy backend source code
COPY server/ .

# Copy built frontend assets from Stage 1 to backend's public folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Expose backend port
EXPOSE 3001

# Start the server
CMD ["node", "index.js"]
