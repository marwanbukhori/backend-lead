# Docker Learning Notes

## Core Concepts

### 1. Containers

- Lightweight, standalone executable packages
- Contains everything needed to run an application
- Isolated from other containers and host system
- Shares the host OS kernel

### 2. Images

- Read-only templates for containers
- Built in layers
- Can be stored in registries (e.g., Docker Hub)
- Defined by Dockerfile

### 3. Dockerfile

- Text file containing build instructions
- Common instructions:
  ```dockerfile
  FROM - Base image
  WORKDIR - Set working directory
  COPY - Copy files from host to container
  RUN - Execute commands during build
  CMD - Default command when container starts
  EXPOSE - Document container ports
  ENV - Set environment variables
  ```

### 4. Docker Compose

- Tool for defining multi-container applications
- Uses YAML file format
- Key concepts:
  - Services: Container configurations
  - Networks: Communication between containers
  - Volumes: Persistent data storage

## Best Practices

### 1. Image Building

- Use specific base image tags
- Multi-stage builds for smaller images
- Group related commands
- Remove unnecessary files
- Use .dockerignore

### 2. Security

- Run as non-root user
- Use official base images
- Scan for vulnerabilities
- Limit container capabilities
- Use secrets management

### 3. Performance

- Minimize layers
- Cache dependencies
- Use appropriate base images
- Optimize startup time
- Resource constraints

### 4. Development

- Use bind mounts for source code
- Hot reload configuration
- Development-specific overrides
- Debug-friendly configurations

## Common Commands

```bash
# Images
docker build -t myapp .
docker pull image:tag
docker push image:tag
docker images

# Containers
docker run -d -p 8080:80 myapp
docker ps
docker logs container_id
docker exec -it container_id sh
docker stop container_id

# Compose
docker-compose up -d
docker-compose down
docker-compose logs
docker-compose exec service_name command

# Cleanup
docker system prune
docker volume prune
docker network prune
```

## Debugging Tips

1. Container Issues

   ```bash
   # Check logs
   docker logs container_id

   # Interactive shell
   docker exec -it container_id sh

   # Resource usage
   docker stats
   ```

2. Network Issues

   ```bash
   # List networks
   docker network ls

   # Inspect network
   docker network inspect network_name

   # Container networking
   docker inspect container_id
   ```

3. Volume Issues

   ```bash
   # List volumes
   docker volume ls

   # Inspect volume
   docker volume inspect volume_name
   ```

## Production Considerations

1. Resource Management

   - Set memory limits
   - CPU constraints
   - Restart policies
   - Health checks

2. Logging

   - Centralized logging
   - Log rotation
   - Structured logging
   - Monitoring integration

3. Scaling

   - Load balancing
   - Service discovery
   - Rolling updates
   - Backup strategies

4. CI/CD Integration
   - Automated builds
   - Testing in containers
   - Registry integration
   - Deployment automation
