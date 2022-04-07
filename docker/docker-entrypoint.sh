#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0
#
set -euo pipefail

RUNHFSC_LOG=$(pwd)/debug.log  DEBUG=* node dist/app.js | npx pino-pretty