/**
 * Gh action workflow step to show node and npm version
 */
export const showNodeAndNpmVersions = {
  name: 'Show Node and npm versions',
  run: [
    'echo "node=$(node -v)"',
    'echo "npm=$(npm -v)"',
    'echo "platform=$(node -p \\"process.platform\\")"',
    'echo "arch=$(node -p \\"process.arch\\")"',
  ].join('\n'),
};