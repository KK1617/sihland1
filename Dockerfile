FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend and server bundle
RUN npm run build

# Configure production environment
ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000

# Start production server
CMD ["node", "dist/server.cjs"]
