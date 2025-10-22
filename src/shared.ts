import { LambdaRuntime } from 'projen/lib/awscdk';
import { NodeProject, NodeProjectOptions, NpmAccess } from 'projen/lib/javascript';
import combine from './combine';
import { EmergencyProcedure } from './emergeny';
import { addMergeJob } from './mergejob';
import { addRepositoryValidationJob } from './validation';

const acceptanceBranchName = 'acceptance';

export interface GemeenteNijmegenOptions {

  /**
   * Enable an additional workflow that allows branch protection bypass
   * and will inform the team trough slack.
   * @default true
   */
  readonly enableEmergencyProcedure?: boolean;
  /**
   * Enable an additional workflow that auto-merges PR's with the 'auto-merge'
   * label. NB: Auto-merge must be on in github settings, and branch protection
   * with checks enabled is required to prevent merges of unsuccesful jobs.
   *
   * @default true
   */
  readonly enableAutoMergeDependencies?: boolean;

  /**
   * Enable an additional workflow that checks if the Github repository is
   * configured according to the desired configuration for Gemeente Nijmegen.
   * This includes emergency workflow, correct secrets, branch protection etc.
   */
  readonly enableRepositoryValidation?: boolean;

}

//type NpmPackageOptions = TypeScriptProjectOptions | AwsCdkConstructLibraryOptions | JsiiProjectOptions;
export type CombinedProjectOptions = NodeProjectOptions & GemeenteNijmegenOptions;

export function setDefaultValues<T extends CombinedProjectOptions>(options: T): T {

  const enableAutoMergeDependencies = options.enableAutoMergeDependencies ?? true;

  /**
   * Set default license
   */
  options = {
    license: 'EUPL-1.2',
    ...options,
  };

  /**
   * Default release options
   */
  const upgradeLabels: string[] = [];
  if (enableAutoMergeDependencies) {
    upgradeLabels.push('auto-merge');
  }
  options = {
    release: true,
    // defaultReleaseBranch: 'production', // Cannot set this one here as it is required in awscdk project type
    majorVersion: 0,
    depsUpgradeOptions: {
      workflowOptions: {
        labels: upgradeLabels,
        branches: [acceptanceBranchName],
      },
    },
    ...options,
  };

  /**
   * Set default github options (Adds docs: as acceptable prefix for PR linting)
   */
  options = {
    githubOptions: {
      mergify: false,
      pullRequestLintOptions: {
        semanticTitleOptions: {
          types: ['fix', 'feat', 'chore', 'docs', 'test'],
        },
      },
    },
    ...options,
  };

  /**
   * Set default gitignore
   */
  options = {
    ...options,
    gitignore: combine(options.gitignore,
      'test-reports/junit.xml',
      'test/__snapshots__/*',
      '.env',
      '.vscode',
      '.DS_Store',
    ),
  };

  return options;
}


export function setDefaultValuesNpmPublish<T extends CombinedProjectOptions>(options: T): T {
  // Set defaults for publishing to npm.js
  if (!options.repository) {
    throw Error('Repository must be set to Github repo for succesfull NPM publishing. Add the `--repository` parameter when creating a new ts-lib project.');
  }

  options = {
    release: true,
    releaseToNpm: true,
    npmAccess: NpmAccess.PUBLIC,
    npmTrustedPublishing: true,
    ...options,
  };
  return options;
}

export function setupSharedConfiguration(
  project: NodeProject,
  options: CombinedProjectOptions,
) {

  const enableEmergencyProcedure = options.enableEmergencyProcedure ?? true;
  const enableAutoMergeDependencies = options.enableAutoMergeDependencies ?? true;
  const enableRepositoryValidation = options.enableRepositoryValidation ?? true;

  /**
   * Enable the emergency procedure when needed
   */
  if (enableEmergencyProcedure) {
    new EmergencyProcedure(project);
  }

  /**
   * Enable auto-merging dependency updates
   */
  const upgradeBranches = options.depsUpgradeOptions?.workflowOptions?.branches;
  if (enableAutoMergeDependencies && upgradeBranches) {
    addMergeJob(project, upgradeBranches);
  }

  /**
   * Enable repo configuration validation workflow
   */
  if (enableRepositoryValidation) {
    addRepositoryValidationJob(project, options);
  }
}


export function setupDefaultCdkOptions<T extends CombinedProjectOptions>(options: T): T {

  /**
   * Set default node runtime version
   */
  options = {
    context: {
      'cli-telemetry': false,
    },
    lambdaOptions: {
      runtime: LambdaRuntime.NODEJS_22_X,
    },
    ...options,
  };

  return options;
}
