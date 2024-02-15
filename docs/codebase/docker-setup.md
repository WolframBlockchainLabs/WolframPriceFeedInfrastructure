# Docker Setup

## Table of Contents

1. [Introduction](#introduction)
2. [Folder Structure](#folder-structure)
3. [Docker Compose Files](#docker-compose-files)
    - [docker-compose.yaml](#docker-composeyaml)
    - [monitoring-compose.yaml](#monitoring-composeyaml)
    - [stress-compose.yaml](#stress-composeyaml)
4. [Environment Variables](#environment-variables)
    - [.env Files](#.env-files)
    - [Environment Variable Examples](#environment-variable-examples)
5. [Configuration Directory](#configuration-directory)
6. [Services](#services)
    - [Backend Service](#backend-service)
    - [Database Services](#database-services)
    - [Messaging Services](#messaging-services)
    - [Cache Service](#cache-service)
    - [Monitoring Services](#monitoring-services)
    - [Performance Testing Service](#performance-testing-service)
7. [Volumes](#volumes)
8. [Health Checks](#health-checks)
9. [Networking](#networking)
10. [Deployment](#deployment)
11. [Continuous Integration](#continuous-integration-(ci)-docker-environment)

---

## Introduction
This document outlines the Docker setup for our project. It details the folder structure, Docker Compose configurations, environment variables, service definitions, and the overall orchestration of containers.

## Folder Structure
The project is structured with a top-level `docker` directory containing all related files for container setup:
- `ci`: Continuous integration configurations.
- `config`: Docker and service configuration files.
- `env`: Environment variable files for services.
- `docker-compose.yaml`: Primary Docker Compose file for service orchestration.
- `monitoring-compose.yaml`: Compose file for monitoring services.
- `stress-compose.yaml`: Compose file for performance testing.

## Docker Compose Files
Docker Compose files define the services, networks, and volumes for Docker containers.

### docker-compose.yaml
Defines the application's backend service, including image sources, dependencies, volume mappings, and command instructions.

### monitoring-compose.yaml
Sets up monitoring tools like Prometheus and Grafana, configuring dependencies, volumes, and ports.

### stress-compose.yaml
Configures the performance testing environment, including the RabbitMQ message broker and performance test parameters.

## Environment Variables
Environment variables are crucial for Docker container configuration, allowing for dynamic setting of parameters.

### .env Files
Each service has a corresponding `.env` file containing specific environment variables. These files are referenced in the Docker Compose configurations to set variables for individual services.

### Environment Variable Examples
For security and configurability, only `.env.example` files are committed to the repository, providing blueprints for the actual environment files. Developers should copy these example files to create their own `.env` files with specific values for their development or production environments.

## Configuration Directory
The `config` directory contains Dockerfiles and service-specific configurations, such as the `Dockerfile` for the backend service and the `prometheus.yml` for monitoring configuration.

## Services
Services are defined in the Docker Compose files, orchestrating the containerized applications and their interactions.

### Backend Service
The backend service runs the main application code and has dependencies on other services such as databases and message queues.

### Database Services
Database services, such as TimescaleDB, are set up with persistence configurations, health checks, and environment variables for connection details.

### Messaging Services
RabbitMQ is used as the messaging service, configured for management and with health checks to ensure message brokering is operational.

### Cache Service
Redis is configured as the caching service, with command overrides to ensure secure password usage and persistent storage mapping.

### Monitoring Services
Prometheus and Grafana are set up for service monitoring, logging, and visualization, with configurations for data sources and dashboards.

### Performance Testing Service
Performance tests are run against the messaging service using a specialized `perf-test` Docker image for load testing.

## Volumes
Volumes are utilized to maintain data persistence across container lifecycle events. For instance:
- `timescale` and `timescale-test` services use a Docker volume bound to `~/docker-volumes/ccdb-private/timescale` and `~/docker-volumes/ccdb-private/timescale-test` respectively, to store database files.
- `redis` service maps `~/docker-volumes/ccdb-private/redis` to its data directory, preserving cache data.
- The `rabbitmq` service uses `~/docker-volumes/ccdb-private/rabbitmq` for persisting message queue data.
- Monitoring services like `prometheus` and `grafana` bind local directories for storing configuration and data to `/prometheus` and `/var/lib/grafana` within the container.

## Health Checks
Custom health checks ensure service reliability and dependency management:
- The `timescale` and `timescale-test` services perform a `pg_isready` check against the respective databases.
- `rabbitmq` service uses `rabbitmq-diagnostics -q ping` to confirm the RabbitMQ server is running.
- `redis` service executes a `redis-cli ping` command to verify the Redis server's availability.
These checks help in orchestrating container startup and readiness in a way that respects inter-container dependencies.

## Networking
Container networking is managed implicitly and explicitly through Docker Compose configurations:
- Ports are mapped between containers and the host to expose services like `backend` on port 8000, `timescale` on port 5432, `rabbitmq` on ports 5672 and 15672, `redis` on port 6379, `prometheus` on port 9090, and `grafana` on port 3000.
- The `depends_on` option in `docker-compose.yaml` ensures that the `backend` service starts only after the `timescale`, `redis`, and `rabbitmq` services report healthy status.
- Hostnames like 'dev-rabbitmq' for the `rabbitmq` service are specified to facilitate inter-service communication within the Docker network.

## Deployment
The Docker Compose files include deployment specifications:
- The `backend` service build context is specified with a Dockerfile and arguments for configuration.
- Replication for services is managed by `deploy` keys in the `docker-compose.yaml` file, as seen with the `collector-body` service, which is set to run 2 replicas.
- Environment variables such as `${BE_REGISTRY_ADDRESS}` and `${BE_TAG}` are used to dynamically pull the appropriate images for the services.
- Command overrides are outlined for each codebase-based service, for example, `command: sh -c "npm run nodemon"` for the `backend` service, dictating the startup command executed within the container.
- Restart policies such as `unless-stopped` are set for services like `rabbitmq` and `redis`, ensuring their continuous operation unless manually halted.

## Continuous Integration (CI) Docker Environment
The CI Docker environment is tailored to facilitate continuous integration testing and is defined in the `ci/docker-compose.yaml` file. This configuration ensures that the CI pipeline has a consistent, isolated environment for running automated tests.

The CI environment consists of the `backend`, `timescale`, and `redis` services, each configured to reflect the test requirements:

- **Backend Service**: 
  - Built from the `Dockerfile` located at `./docker/config/backend/Dockerfile`.
  - The image and container name are dynamically set using the `${BACKEND_IMAGE}` and `${BACKEND_CONTAINER_NAME}` environment variables.
  - It depends on the `timescale` and `redis` services, ensuring they are healthy before the backend starts.
  - The `.env.backend` file is specified for environment configuration.
  - The `entrypoint` is overridden to `tail -f /dev/null`, effectively pausing the service, which allows for manual intervention or test execution.

- **Timescale Service**: 
  - Uses the `timescale/timescaledb:2.11.1-pg15` image.
  - Includes a health check that runs `pg_isready` to verify the database is accepting connections.
  - Environment variables such as `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` are set, with the password explicitly defined as `password` for testing purposes.
  - The `container_name` is set to `ccdb-timescale-test` to distinguish it from production instances.
  - The `command` option sets the `max_connections` to `10000`, accommodating a high number of concurrent connections suitable for testing environments.

- **Redis Service**: 
  - Runs `redis:7.2.3` image.
  - The container is named `ccdb-redis` and it executes a custom `redis-server` command with a requirement for the `REDIS_PASSWORD` environment variable.
  - A health check is implemented using `redis-cli ping` to confirm the availability of the service.
  - The `REDIS_PASSWORD` is directly set in the configuration, indicating a static password for CI testing.

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main doc file](../../README.md)
