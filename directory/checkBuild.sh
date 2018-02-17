#!/usr/bin/env bash
# NOTE: You must be in this directory to run this script

set -o errexit

./buildLogos.js
./buildDirectory.js

if git diff --name-only logos.json | grep logos;
then
  echo 'ERROR: logos.json changes needs to be checked in';
  exit 1
fi;
if git diff --name-only directory.json | grep directory;
then
  echo 'ERROR: directory.json changes needs to be checked in';
  exit 1
fi;


openssl dgst -sha256 directory.json
