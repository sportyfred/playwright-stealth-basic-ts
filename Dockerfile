# Use official Playwright image with all browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.50.0-noble

# Install Xvfb for virtual display
RUN apt-get update && apt-get install -y xvfb

# Set environment variables
ENV NODE_ENV=production
ENV DISPLAY=:99

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create directory for screenshots
RUN mkdir -p /app/screenshots

# Start Xvfb and run your app
CMD ["sh", "-c", "Xvfb :99 -screen 0 1280x800x24 & npm start"]