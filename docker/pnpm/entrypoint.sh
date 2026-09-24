#!/bin/sh
set -e

if [ "$CHROMIUM" = "true" ]; then
  exec pnpm dev
else
  exec pnpm dev:firefox
fi