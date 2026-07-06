const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch the shared folder outside of the mobile directory
const sharedPath = path.resolve(__dirname, '../shared');
config.watchFolders = [sharedPath];

// Ensure Metro resolves packages using mobile's node_modules first
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Prevent Metro from resolving @types/* packages as runtime modules.
// @types/react has "main": "" which Metro interprets as "index", but only
// index.d.ts exists (no .js), causing resolution failures.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // When resolving a bare module like "react", if Metro picks up
  // @types/react first (due to Node resolution order), the resolution
  // will fail because @types packages don't have JS entry points.
  // We intercept and force resolution from the real package.
  if (
    !moduleName.startsWith('.') &&
    !moduleName.startsWith('/') &&
    !moduleName.startsWith('@types/')
  ) {
    try {
      return context.resolveRequest(context, moduleName, platform);
    } catch (error) {
      // If the error message mentions @types, try resolving the module
      // explicitly from our node_modules (bypassing @types)
      if (error.message && error.message.includes('@types')) {
        const realModulePath = path.resolve(
          __dirname,
          'node_modules',
          moduleName
        );
        try {
          return context.resolveRequest(
            { ...context, originModulePath: realModulePath + '/package.json' },
            moduleName,
            platform
          );
        } catch {
          throw error;
        }
      }
      throw error;
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Ensure packages are resolved from mobile's local node_modules
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => path.join(__dirname, 'node_modules', name),
  }
);

module.exports = config;
