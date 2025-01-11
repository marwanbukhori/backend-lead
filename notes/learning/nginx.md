# Nginx Learning Notes

## Core Concepts

### 1. What is Nginx?

- High-performance web server
- Reverse proxy server
- Load balancer
- HTTP cache
- Event-driven, asynchronous architecture

### 2. Reverse Proxy

- Sits between clients and backend servers
- Benefits:
  - Load balancing
  - SSL termination
  - Caching
  - Security
  - Compression

### 3. Basic Configuration Structure

```nginx
# Main context
events {
    worker_connections 1024;
}

http {
    # HTTP context
    server {
        # Server context
        listen 80;
        server_name example.com;

        location / {
            # Location context
            proxy_pass http://backend;
        }
    }
}
```

## Common Configurations

### 1. Basic Reverse Proxy

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Load Balancing

```nginx
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

### 3. SSL Configuration

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

### 4. Caching

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;

server {
    location / {
        proxy_cache my_cache;
        proxy_cache_use_stale error timeout http_500;
        proxy_cache_valid 200 60m;
    }
}
```

## Best Practices

### 1. Security

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self';";

# Rate limiting
limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
location / {
    limit_req zone=one burst=5;
}
```

### 2. Performance

```nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 10240;
gzip_proxied expired no-cache no-store private auth;
gzip_types text/plain text/css text/xml application/javascript;

# Browser caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}
```

### 3. Logging

```nginx
# Access log format
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for"';

access_log /var/log/nginx/access.log main;
error_log /var/log/nginx/error.log warn;
```

## Common Use Cases

### 1. Single Page Application

```nginx
server {
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 2. WebSocket Support

```nginx
location /ws/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 3. API Gateway

```nginx
location /api/v1/ {
    proxy_pass http://api_backend:3000/;
    proxy_set_header X-API-Version "1.0";
}

location /api/v2/ {
    proxy_pass http://api_backend_v2:3000/;
    proxy_set_header X-API-Version "2.0";
}
```

## Debugging Tips

1. Check Nginx Status

```bash
nginx -t  # Test configuration
nginx -T  # Test and print configuration
systemctl status nginx  # Check service status
```

2. Common Log Locations

```bash
/var/log/nginx/access.log
/var/log/nginx/error.log
```

3. Debug Headers

```nginx
add_header X-Debug-Message $request_uri;  # Debug routing
add_header X-Cache-Status $upstream_cache_status;  # Debug caching
```

## Monitoring & Maintenance

1. Status Module

```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

2. Health Checks

```nginx
location /health {
    access_log off;
    return 200 'healthy\n';
    add_header Content-Type text/plain;
}
```

3. Graceful Reload

```bash
nginx -s reload  # Reload configuration
```
