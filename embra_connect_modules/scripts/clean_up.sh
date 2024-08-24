#!/bin/bash

sudo docker system prune -f

# Get the container IDs of containers with names matching a specific pattern
container_ids=$(docker ps -aqf "name=embra_connect_modules_*")

# Check if there are any containers to delete
if [[ -n ${container_ids} ]]; then
	# Delete the containers
	docker rm -f "$container_ids"
	echo "Deleted containers with IDs: ${container_ids}"
else
	echo "No containers found matching the specified pattern."
fi

# Retrieve all image IDs
image_ids=$(docker images -aq)

# Check if there are any images to delete
if [[ -n ${image_ids} ]]; then
	# Delete the images
	docker rmi -f $image_ids
	if [[ $? -eq 0 ]]; then
		echo "Images deleted successfully."
	else
		echo "Failed to delete images."
	fi
else
	echo "No images found."
fi
