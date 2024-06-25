#!/bin/bash

# Check if Docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: Docker is not installed.' >&2
  exit 1
fi

# Check if Docker Swarm is already initialized
docker swarm init 2>/dev/null

# Create a stack and deploy the services
STACK_NAME="embra_stack"

echo "Deploying stack $STACK_NAME..."
docker stack deploy -c docker-compose.yml $STACK_NAME

echo "Services deployed successfully!"

sudo docker stack services embra_stack