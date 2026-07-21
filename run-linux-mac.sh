#!/usr/bin/env sh
set -e
npm ci
npm run doctor
npm run audit
npm run dev
