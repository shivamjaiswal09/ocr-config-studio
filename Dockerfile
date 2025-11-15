FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Create directories
RUN mkdir -p uploads outputs

EXPOSE 3000

CMD ["npm", "start"]

