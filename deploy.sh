#!/usr/bin/env sh
set -eu
# This file previously called itself indefinitely. Do not deploy without checks.
echo "This script does not auto-deploy. Verify environment, dependencies, tests, and hosting target first."
echo "For local use: install dependencies, set OPENAI_API_KEY and MASTERBOT_ACCESS_TOKEN, then run npm start."
exit 0
