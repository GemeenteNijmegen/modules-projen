import { cdk } from 'projen';
import { GithubCredentials } from 'projen/lib/github';
import { NodePackageManager, NpmAccess } from 'projen/lib/javascript';
import { Defaults } from './src/defaults';
import { showNodeAndNpmVersions } from './src/workflowSteps';

const organizationName = '@gemeentenijmegen';
const projectName = 'projen-project-type';
const packageName = `${organizationName}/${projectName}`;

const project = new cdk.JsiiProject({
  author: organizationName,
  authorAddress: 'devops@nijmegen.nl',
  repositoryUrl: 'https://github.com/GemeenteNijmegen/modules-projen.git',
  defaultReleaseBranch: 'main',
  majorVersion: 1,
  name: projectName,
  projenrcTs: true,
  license: 'EUPL-1.2',
  release: true,
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  npmTrustedPublishing: true,
  packageManager: NodePackageManager.NPM,
  workflowNodeVersion: Defaults.DEFAULT_NODE_VERSION,
  buildWorkflowOptions: {
    preBuildSteps: [
      showNodeAndNpmVersions,
    ],
  },
  devDeps: [
    'ts-node',
  ],
  peerDeps: [
    'projen@>=0.99.27',
    'constructs',
  ], // Make sure the consuming library will provide a projen version.
  packageName: packageName,
  scripts: {
    'extract': 'cd dist/js && rm -rf package && tar -xzvf projen-project-type@*',
    'bundle-templates': 'npx ts-node src/sample/bundletemplates.ts',
  },
  githubOptions: {
    projenCredentials: GithubCredentials.fromApp(),
  },
});

project.tasks.tryFind('pre-compile')?.exec('npx projen bundle-templates');

project.synth();
