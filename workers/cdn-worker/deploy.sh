#!/bin/bash

HOME_DIR="$HOME"
ESBUILD_BINARY_PATH="$HOME_DIR/esbuilds/0.28.1/esbuild"
export ESBUILD_BINARY_PATH

# echo "ESBUILD_BINARY_PATH is set to: $ESBUILD_BINARY_PATH"

pnpm wrangler deploy --profile lkekana