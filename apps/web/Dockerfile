# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy frontend package files
COPY package.json package-lock.json ./
RUN npm install

# Copy frontend source
COPY . ./
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
