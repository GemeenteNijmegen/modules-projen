const { cdk } = require('projen');
const { NpmAccess } = require('projen/lib/javascript');

const organizationName = '@gemeentenijmegen';
const projectName = 'projen-project-type';
const packageName = `${organizationName}/${projectName}`;

const project = new cdk.JsiiProject({
  author: organizationName,
  repository: 'https://github.com/GemeenteNijmegen/modules-projen.git',
  defaultReleaseBranch: 'main',
  majorVersion: 1,
  name: projectName,
  license: 'EUPL-1.2',
  release: true,
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  devDeps: [
    '@glen/jest-raw-loader',
  ],
  peerDeps: [
    'projen',
    'constructs',
  ], // Make sure the consuming library will provide a projen version.
  packageName: packageName,
  scripts: {
    extract: 'cd dist/js && rm -rf package && tar -xzvf projen-project-type@*',
    'bundle-templates': '',
  },
});

project.tasks.tryFind("pre-compile")?.exec("npx projen bundle-templates");

project.synth();