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

# Create a Python virtual environment and install packages
RUN python3 -m venv /home/coder/venv && \
    /home/coder/venv/bin/pip install --no-cache-dir pyspark polars

# Set the PATH to include the virtual environment
ENV PATH="/home/coder/venv/bin:${PATH}"

COPY ./bin /home/coder/.drivers

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 CMD curl --fail http://localhost:8080 || exit 1

ENTRYPOINT ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none"]
