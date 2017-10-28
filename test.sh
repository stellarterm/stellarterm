#!/bin/sh
npm run directory # Makes sure the directory is valid

# Ticker test disabled for now
# cd api
# echo "Test api ticker generator"
# node localTicker.js
# cd ..

node test/smoke.js # Smoke test on the StellarTerm html build file
