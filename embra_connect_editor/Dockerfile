FROM ubuntu:latest

# Install necessary packages
RUN apt-get update && apt-get install -y \
    kate \
    dbus-x11 \
    x11-apps \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set environment variables for X11 forwarding
ENV DISPLAY=:0
