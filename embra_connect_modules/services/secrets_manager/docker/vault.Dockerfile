FROM hashicorp/vault:latest

ENV VAULT_DEV_ROOT_TOKEN_ID=ec-vault-token
ENV VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200

EXPOSE 8200

# Start Vault server in development mode.
CMD ["vault", "server", "-dev", "-dev-root-token-id=ec-vault-token", "-dev-listen-address=0.0.0.0:8200"]

# Run container in development mode.
# docker run -d --rm --cap-add=IPC_LOCK --name vault-server -p 8200:8200 -e 'VAULT_DEV_ROOT_TOKEN_ID=token' -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' hashicorp/vault


# Reference docs.
# https://discuss.hashicorp.com/t/cant-access-ui-when-running-vault-in-dev-mode-from-docker/41521/6

# https://github.com/jmgilman/vaultrs
# https://hub.docker.com/r/hashicorp/vault
# https://www.bing.com/videos/riverview/relatedvideo?q=how+to+use+hashicorp+vault&mid=8EFE2B4EBB952196FF2F8EFE2B4EBB952196FF2F&FORM=VIRE 