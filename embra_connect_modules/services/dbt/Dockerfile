FROM rust:latest

# Set working directory
WORKDIR /services/dbt

# Copy contents over to image file system
COPY . ./

# Compile binary
RUN cargo build --release

# Run binary
CMD [ "cargo", "run" ]

EXPOSE 3000