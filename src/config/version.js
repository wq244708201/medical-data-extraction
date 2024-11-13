// src/config/version.js
import pkg from '../../package.json' assert { type: 'json' };

export const APP_VERSION = `v${pkg.version}`;
