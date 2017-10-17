#!/usr/bin/env node
const fs = require('fs');
const directory = require('./directory');

fs.writeFileSync('./directory.json', directory.toJson());
