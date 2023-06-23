#!/bin/bash

source ./scripts/boot.sh

docker push ${BE_REGISTRY_ADDRESS}:${BE_TAG}
