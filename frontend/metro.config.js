const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Use Watchman for file watching (faster, avoids EMFILE on macOS).
// Watchman must be started with XDG_STATE_HOME=/tmp to avoid the
// 104-char socket path limit caused by long macOS usernames.
// The start.sh script handles this automatically.
config.watchFolders = [__dirname];

module.exports = config;
