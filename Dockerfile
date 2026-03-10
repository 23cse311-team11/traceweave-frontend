# Use a lightweight Node.js image
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build Next.js app
RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]
