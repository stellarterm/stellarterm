#!/bin/sh
npm run directory # Makes sure the directory is valid

# Ticker test disabled for now
# cd api
# echo "Test api ticker generator"
# node localTicker.js
# cd ..

# Commented out because Puppeteer doesn't work on Travis-CI
# because Chrome doesn't run in docker. To fix, we would have to disable
# sandboxing, which is kinda scary.
# node test/smoke.js # Smoke test on the StellarTerm html build file
