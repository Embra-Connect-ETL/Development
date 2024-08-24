# <code-server> container configuration

# Note: The standalone arm64 .deb does not support Ubuntu 16.04 or earlier. Please upgrade or build with npm.

# curl -fOL https://github.com/coder/code-server/releases/download/v$VERSION/code-server_${VERSION}_amd64.deb
# sudo dpkg -i code-server_${VERSION}_amd64.deb
# sudo systemctl enable --now code-server@$USER
# The code editor can be accessed at http://127.0.0.1:8080.

# The <default> password can be found in ~/.config/code-server/config.yaml



FROM ubuntu:mantic-20240530

# Set the environment variable for non-interactive installation
ENV DEBIAN_FRONTEND=noninteractive

# Install necessary dependencies
RUN apt-get update --no-install-recommends && \
    apt-get install build-essential -y --no-install-recommends && \
    apt-get install -y curl sudo python3 python3-pip python3-venv git --no-install-recommends && \
    apt-get clean

# Set code-server version
ARG VERSION=4.4.0

RUN curl -fOL https://github.com/coder/code-server/releases/download/v${VERSION}/code-server_${VERSION}_amd64.deb && \
    dpkg -i code-server_${VERSION}_amd64.deb && \
    rm code-server_${VERSION}_amd64.deb

# Create a non-root user to run code-server
RUN useradd -m coder && \
    echo "coder ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER coder

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/home/coder/.cargo/bin:${PATH}"

RUN pip3 install --no-cache-dir pyspark polars

COPY ./bin /home/coder/.drivers

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 CMD curl --fail http://localhost:8080 || exit 1

ENTRYPOINT ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none"]