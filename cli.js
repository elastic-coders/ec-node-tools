#!/usr/bin/env node

'use strict';

const startTools = require('./index');

startTools().then(args => args.tool(args));
