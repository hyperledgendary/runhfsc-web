#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0
#
set -euo pipefail

RUNHFSC_LOG=$(pwd)/debug.log  DEBUG=* node dist/app.js --config /fabric/appcfg/runhfsc.json | npx pino-pretty