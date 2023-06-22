#!/bin/bash

# Check if the .env file exists in the current directory
if [ ! -f ./.env ]; then
    echo "Operation failed. It appears the .env file hasn't been created yet."
    echo "Please check the README.md file for instructions on how to create it."
    # Exit the script to prevent further actions since .env file is essential
    exit 1
fi

# Set the path to the docker-compose.yml file
# Change this if your file is located somewhere else
PATH_TO_COMPOSE="./docker/docker-compose.yml"

# Use 'set -a' to mark variables which follow for export
# 'source .env' loads the variables from the .env file into the shell
# 'set +a' stops marking variables for export
# This way, we can use the variables from the .env file later in this script
set -a; source .env; set +a;

# Export the PATH_TO_COMPOSE variable so it's available to commands and scripts invoked from this script
export PATH_TO_COMPOSE
