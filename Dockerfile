FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies (use package-lock if present)
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production

# Copy source
COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
