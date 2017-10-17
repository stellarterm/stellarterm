./buildDirectory.js
./buildLogos.js

if git diff --name-only directory.json | grep directory;
then
  echo 'ERROR: directory.json changes needs to be checked in';
  exit 1
fi;

if git diff --name-only logos.json | grep logos;
then
  echo 'ERROR: logos.json changes needs to be checked in';
fi;

openssl dgst -sha256 directory.json
