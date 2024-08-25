FROM hashicorp/vault:latest

ENV VAULT_DEV_ROOT_TOKEN_ID=ec-vault-token
ENV VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200

EXPOSE 8200

# Start Vault server in development mode.
CMD ["vault", "server", "-dev", "-dev-root-token-id=ec-vault-token", "-dev-listen-address=0.0.0.0:8200"]
