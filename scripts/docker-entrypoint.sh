#!/bin/sh
set -e

# Load Docker secrets as environment variables.
# Docker Compose mounts secrets as files in /run/secrets/<name>.
# This reads each file and exports its content as an env var
# so ConfigService / process.env picks them up.

if [ -d "/run/secrets" ]; then
  for secret_file in /run/secrets/*; do
    if [ -f "$secret_file" ]; then
      secret_name=$(basename "$secret_file")
      secret_value=$(cat "$secret_file")
      export "$secret_name"="$secret_value"
    fi
  done
fi

exec "$@"
