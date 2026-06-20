# Stage 1: Compiling application layout
FROM node:20-alpine AS build_stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve layout files through lightweight reverse proxy layers
FROM nginx:alpine
COPY --from=build_stage /app/dist /usr/share/nginx/html

# Replace standard engine configurations to manage application routes appropriately
RUN echo $'\n\
server {\n\
    listen 80;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]