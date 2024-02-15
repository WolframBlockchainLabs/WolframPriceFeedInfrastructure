# Bash Scripts Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Script Files Overview](#script-files-overview)
3. [Script Descriptions](#script-descriptions)
    - [boot.sh](#bootsh)
    - [build.sh](#buildsh)
    - [push.sh](#pushsh)
    - [scale.sh](#scalesh)
    - [start.sh](#startsh)
    - [stop.sh](#stopsh)
4. [Usage](#usage)
5. [Best Practices](#best-practices)

---

## Introduction

This document provides a detailed guide on the usage and functions of scripts within the `scripts` directory. These scripts are used to manage the Docker containers and Kubernetes secrets for the project.

## Script Files Overview

The `scripts` directory contains several shell scripts that automate the processes of building, starting, stopping, and managing Docker Compose services and Kubernetes secrets.

## Script Descriptions

### boot.sh

Initializes the environment by checking for the presence of the `.env` file and sourcing environment variables. It sets the paths to the Docker Compose files used by other scripts.

### build.sh

Invokes the `boot.sh` script to set up the environment and then builds the Docker images using the Docker Compose file.

### push.sh

Pushes the Docker image to the registry using the image tag specified in the `.env` file.

### scale.sh

Scales a specific service, `ccxt-collectors`, to a specified number of instances. It defaults to 2 instances.

### start.sh

Starts all the services defined in the Docker Compose file by removing any existing containers and creating new ones.

### stop.sh

Stops all services by bringing down the containers initiated by `start.sh`.

## Usage

To use the scripts, run them from the command line with `./scripts/<script_name>.sh`. Ensure you have the necessary permissions to execute these scripts.

## Best Practices

-   Ensure that Docker is properly installed and configured on your system before running these scripts.
-   Always check the `.env` files for the correct environment variables before executing the build, start, and stop scripts.

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main doc file](../../README.md)
