# Use the official code-server image as the base
FROM codercom/code-server:latest

# Switch to root user to install additional tools
USER root

# Install additional tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    # Add other tools as needed
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PASSWORD=password
ENV SUDO_PASSWORD=password

# Expose the necessary port
EXPOSE 8080

# Command to start code-server
CMD ["code-server", "--bind-addr", "0.0.0.0:8080"]
