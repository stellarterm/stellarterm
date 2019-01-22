#!/usr/bin/env bash
# NOTE: You must be in this directory to run this script

set -o errexit

if git diff --name-only directory.js | grep directory;
then
  printf "\033[1;31mERROR: \033[0;31mdirectory.js changes needs to be checked in\033[0m\n";
  exit 1
fi;

./buildLogos.js
./buildDirectory.js


openssl dgst -sha256 directory.js
