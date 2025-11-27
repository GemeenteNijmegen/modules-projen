import { LambdaRuntime } from 'projen/lib/awscdk';
import { synthSnapshot } from 'projen/lib/util/synth';
import { GemeenteNijmegenCdkApp, GemeenteNijmegenCdkLib, GemeenteNijmegenJsii, GemeenteNijmegenTsPackage } from '../src';

const repository = 'https://github.com/GemeenteNijmegen/test';

beforeAll(() => {
  process.env.DO_NOT_GENERATE_FILES_IN_TEST = 'true';
});

describe('NijmegenProject Defaults', () => {

  const project = new GemeenteNijmegenTsPackage({ defaultReleaseBranch: 'main', name: 'test project', repository });
  const snapshot = synthSnapshot(project);

  test('EUPL-1.2 license default', () => {
    expect(snapshot.LICENSE).toContain('EUROPEAN UNION PUBLIC LICENCE v. 1.2');
  });

  test('Release', () => {
    expect(snapshot['.github/workflows/release.yml']).toBeDefined();
  });

  test('PR Linting', () => {
    const allowedLabels = ['fix', 'feat', 'chore', 'docs'];
    const PrLintWorkflow = snapshot['.github/workflows/pull-request-lint.yml'];
    expect(PrLintWorkflow).toBeDefined();
    allowedLabels.forEach(l => expect(PrLintWorkflow).toContain(l));
  });

  test('Upgrade acceptance', () => {
    const upgradeWorkflow = snapshot['.github/workflows/upgrade-acceptance.yml'];
    expect(upgradeWorkflow).toBeDefined();
    expect(upgradeWorkflow).toContain('auto-merge');
  });

  test('Git ignore', () => {
    const defaults = [
      'test-reports/junit.xml',
      'test/__snapshots__/*',
      '.env',
      '.vscode',
      '.DS_Store',
    ];
    const ignore = snapshot['.gitignore'];
    defaults.forEach(d => expect(ignore).toContain(d));
  });

});


describe('NijmegenProject NPM', () => {

  test('cdk-app project does not publish to NPM', () => {
    const project = new GemeenteNijmegenCdkApp({
      cdkVersion: '2.1.0',
      defaultReleaseBranch: 'main',
      name: 'test project',
    });
    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/release.yml']).not.toContain('Publish to npm');
  });

  test('cdk-lib project publish to NPM', () => {
    const project = new GemeenteNijmegenCdkLib({
      cdkVersion: '2.1.0',
      defaultReleaseBranch: 'main',
      name: 'test project',
      author: 'test',
      authorAddress: 'test@example.com',
      repositoryUrl: 'github.com',
      repository,
    });
    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/release.yml']).toContain('Publish to npm');
  });

  test('ts-lib project publish to NPM', () => {
    const project = new GemeenteNijmegenTsPackage({
      defaultReleaseBranch: 'main',
      name: 'test project',
      repository,
    });
    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/release.yml']).toContain('Publish to npm');
  });

  test('jsii project publish to NPM', () => {
    const project = new GemeenteNijmegenJsii({
      defaultReleaseBranch: 'main',
      name: 'test project',
      author: 'test',
      authorAddress: 'test@example.com',
      repositoryUrl: 'github.com',
      repository,
    });
    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/release.yml']).toContain('Publish to npm');
  });

});

describe('NijmegenProject auto-merge workflow', () => {
  test('Contains automerge workflow by default', () => {
    const project = new GemeenteNijmegenCdkApp({ cdkVersion: '2.51.0', defaultReleaseBranch: 'main', name: 'test project' });

    const snapshot = synthSnapshot(project)['.github/workflows/auto-merge.yml'];
    expect(snapshot).toContain(
      'if: contains(github.event.pull_request.labels.*.name, \'auto-merge\') && (github.base_ref == \'acceptance\')',
    );
  });

  test('Contains automerge workflow on multiple branches', () => {
    const project = new GemeenteNijmegenCdkApp({
      cdkVersion: '2.51.0',
      defaultReleaseBranch: 'main',
      name: 'test project',
      depsUpgradeOptions: {
        workflowOptions: {
          labels: ['auto-merge'],
          branches: ['acceptance', 'development'],
        },
      },
    });

    const snapshot = synthSnapshot(project)['.github/workflows/auto-merge.yml'];
    expect(snapshot).toContain(
      'if: contains(github.event.pull_request.labels.*.name, \'auto-merge\') && (github.base_ref == \'acceptance\' || github.base_ref == \'development\')',
    );
  });

  test('Doesn\'t contain automerge workflow when option is set', () => {
    const project = new GemeenteNijmegenCdkApp({ cdkVersion: '2.51.0', defaultReleaseBranch: 'main', name: 'test project', enableAutoMergeDependencies: false });

    const snapshot = synthSnapshot(project);
    expect(snapshot).not.toHaveProperty('.github/workflows/auto-merge.yml');
  });

});


describe('Default lambda runtime for CDK app and lib', () => {

  test('CDK app has default lambda runtime', () => {
    const project = new GemeenteNijmegenCdkApp({ cdkVersion: '2.51.0', defaultReleaseBranch: 'main', name: 'test project', enableAutoMergeDependencies: false });
    expect(project.configuredOptions().lambdaOptions?.runtime).toBe(LambdaRuntime.NODEJS_24_X);
  });

  test('CDK lib has default lambda runtime', () => {
    const project = new GemeenteNijmegenCdkLib({ cdkVersion: '2.51.0', defaultReleaseBranch: 'main', name: 'test project', author: 'test', authorAddress: '', repositoryUrl: '', repository });
    expect(project.configuredOptions().lambdaOptions?.runtime).toBe(LambdaRuntime.NODEJS_24_X);
  });

  test('CDK context cli-optout flag is set', () => {
    const project = new GemeenteNijmegenCdkApp({ cdkVersion: '2.51.0', defaultReleaseBranch: 'main', name: 'test project', repository });
    const snapshot = synthSnapshot(project)['cdk.json'];
    expect(snapshot.context['cli-telemetry']).toBe(false);
  });

});

describe('Error on no repository', () => {

  test('CDK lib throws error on no repository', () => {
    expect(() => {
      new GemeenteNijmegenCdkLib({
        cdkVersion: '2.51.0',
        defaultReleaseBranch: 'main',
        name: 'test project',
        author: 'test',
        authorAddress: '',
        repositoryUrl: '',
      });
    }).toThrow();
  });

});

describe('NijmegenProject repo conf validation workflow', () => {


  // Log all warn messages
  let logs: string[] = [];
  beforeEach(() => {
    logs = [];
    console.warn = (...data: any[]) => {
      if (data && data.length > 0 && data[0]) {
        logs.push(data[0].toString());
      }
      console.log(data);
    };
  });

  test('Contains no validation logging on defaults', () => {
    const project = new GemeenteNijmegenCdkApp({
      cdkVersion: '2.51.0',
      defaultReleaseBranch: 'main',
      name: 'test project',
    });

    synthSnapshot(project);
    expect(logs).not.toContain('❗️ Emergency workflow is not enabled, is this intentional?');
    expect(logs).not.toContain('❗️ Auto-merging of dependencies is not enabled, is this intentional?');
    expect(logs).not.toContain('❗️ Emergency workflow is not enabled, is this intentional?');
  });

  test('Contains validation logging on overwritten defaults', () => {
    const project = new GemeenteNijmegenCdkApp({
      cdkVersion: '2.51.0',
      defaultReleaseBranch: 'main',
      name: 'test project',
      enableAutoMergeDependencies: false,
      enableEmergencyProcedure: false,
      depsUpgrade: false,
    });

    synthSnapshot(project);
    expect(logs).toContain('❗️ Emergency workflow is not enabled, is this intentional?');
    expect(logs).toContain('❗️ Auto-merging of dependencies is not enabled, is this intentional?');
    expect(logs).toContain('❗️ Emergency workflow is not enabled, is this intentional?');
  });


  test('Contains no validation logging on defaults', () => {
    const project = new GemeenteNijmegenTsPackage({
      defaultReleaseBranch: 'main',
      name: 'test project',
      repository,
    });

    synthSnapshot(project);
    expect(logs).not.toContain('❗️ No publishing to NPM is configured, is this intentional?');
    expect(logs).not.toContain('❗️ Emergency workflow is not enabled, is this intentional?');
    expect(logs).not.toContain('❗️ Auto-merging of dependencies is not enabled, is this intentional?');
    expect(logs).not.toContain('❗️ Emergency workflow is not enabled, is this intentional?');
  });

  test('Contains validation logging on overwritten defaults', () => {
    const project = new GemeenteNijmegenTsPackage({
      defaultReleaseBranch: 'main',
      name: 'test project',
      enableAutoMergeDependencies: false,
      enableEmergencyProcedure: false,
      releaseToNpm: false,
      depsUpgrade: false,
      repository,
    });

    synthSnapshot(project);
    expect(logs).toContain('❗️ No publishing to NPM is configured, is this intentional?');
    expect(logs).toContain('❗️ Emergency workflow is not enabled, is this intentional?');
    expect(logs).toContain('❗️ Auto-merging of dependencies is not enabled, is this intentional?');
    expect(logs).toContain('❗️ Emergency workflow is not enabled, is this intentional?');
  });

  test('Contains no validation logging on disabled validation', () => {
    const project = new GemeenteNijmegenTsPackage({
      defaultReleaseBranch: 'main',
      name: 'test project',
      enableRepositoryValidation: false,
      repository,
    });

    synthSnapshot(project);
    expect(logs).not.toContain('❗️ No publishing to NPM is configured, is this intentional?');
    expect(logs).not.toContain('❗️ Emergency workflow is not enabled, is this intentional?');
    expect(logs).not.toContain('❗️ Auto-merging of dependencies is not enabled, is this intentional?');
    expect(logs).not.toContain('❗️ Emergency workflow is not enabled, is this intentional?');
  });

});
