#!/bin/bash

source ./scripts/boot.sh

docker compose --project-name "$PROJECT_NAME" --file "$PATH_TO_COMPOSE" down
