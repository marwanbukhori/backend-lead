# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Development stage (for hot reloading)
FROM builder as development
CMD ["npm", "run", "dev", "--", "--host"]

# Build for production
FROM builder as production-build
RUN npm run build

# Production stage
FROM nginx:alpine as production

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=production-build /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
