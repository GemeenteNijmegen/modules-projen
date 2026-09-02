/**
 * Gh action workflow step to show node and npm version
 */
export const showNodeAndNpmVersions = {
  name: 'Show Node and npm versions',
  run: [
    'echo "node=$(node -v)"',
    'echo "npm=$(npm -v)"',
    'echo "which node=$(which node)"',
    'echo "which npm=$(which npm)"',
    'npm config get user-agent',
  ].join('\n'),
};