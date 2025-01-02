CONNECT_IDE_DIR = ./services/connect_ide/server
GENERIC_AUTH_DIR = ./services/generic-auth-module

CARGO = cargo

# Default target when running `make`
all: help

# Usage dialog
help:
	@echo "Makefile for managing Rust projects."
	@echo "Usage:"
	@echo "  make connect_ide       - Build and run Connect IDE"
	@echo "  make generic_auth      - Build and run the Generic Auth Module"
	@echo "  make build_all         - Build both projects"
	@echo "  make clean_all         - Clean both projects"

# Build and run Connect IDE
connect_ide:
	@echo "Building and running Connect IDE project..."
	cd $(CONNECT_IDE_DIR) && $(CARGO) run

# Build and run the Generic Auth Module
generic_auth:
	@echo "Building and running Generic Auth Module project..."
	cd $(GENERIC_AUTH_DIR) && $(CARGO) run

# Build both projects
build_all: connect_ide_build generic_auth_build

connect_ide_build:
	@echo "Building Connect IDE project..."
	cd $(CONNECT_IDE_DIR) && $(CARGO) build

generic_auth_build:
	@echo "Building Generic Auth Module project..."
	cd $(GENERIC_AUTH_DIR) && $(CARGO) build

# Clean both projects (remove target directories)
clean_all: clean_connect_ide clean_generic_auth

clean_connect_ide:
	@echo "Cleaning Connect IDE project..."
	cd $(CONNECT_IDE_DIR) && $(CARGO) clean

clean_generic_auth:
	@echo "Cleaning Generic Auth Module project..."
	cd $(GENERIC_AUTH_DIR) && $(CARGO) clean
