FROM rust:1.73-slim-bullseye

WORKDIR /app

ENV ROCKET_ADDRESS=0.0.0.0
ENV ROCKET_PORT=8000

COPY ./target/x86_64-unknown-linux-musl/release/web_app /app/

CMD ["/app/web_app"]

EXPOSE 8000
