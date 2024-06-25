#!/bin/bash

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to install kubectl
install_kubectl() {
  echo "Installing kubectl..."
  curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
  chmod +x ./kubectl
  sudo mv ./kubectl /usr/local/bin/kubectl
}

# Function to install Minikube
install_minikube() {
  echo "Installing Minikube..."
  curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
  chmod +x minikube
  sudo mv minikube /usr/local/bin/
}

# Check for kubectl
if command_exists kubectl; then
  echo "kubectl is already installed."
else
  echo "kubectl is not installed."
  install_kubectl
fi

# Check for minikube
if command_exists minikube; then
  echo "minikube is already installed."
else
  echo "minikube is not installed."
  install_minikube
fi

# Start Minikube if not running
if minikube status | grep -q "Running"; then
  echo "Minikube is already running."
else
  echo "Starting Minikube..."
  minikube start
fi

echo "All dependencies are installed and Minikube is running."
