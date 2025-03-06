import { Criticality } from '@gemeentenijmegen/aws-constructs';
import { Environment } from 'aws-cdk-lib';
import { Statics } from './Statics';

/**
 * Adds a configuration field to another interface
 */
export interface Configurable {
  configuration: Configuration;
}

/**
 * Basic configuration options per environment
 */
export interface Configuration {
  /**
   * Branch name for the applicible branch (this branch)
   */
  branchName: string;

  /**
   * The pipeline will run from this environment
   *
   * Use this environment for your initial manual deploy
   */
  buildEnvironment: Required<Environment>;

  /**
   * Environment to deploy the application to
   *
   * The pipeline (which usually runs in the build account) will
   * deploy the application to this environment. This is usually
   * the workload AWS account in our default region.
   */
  deploymentEnvironment: Required<Environment>;

  /**
   * Base criticality for monitoring deployed for this branch.
   */
  criticality: Criticality;

}

const configurations: Configuration[] = [
  {
    branchName: 'development',
    buildEnvironment: Statics.buildEnvironment,
    deploymentEnvironment: Statics.developmentEnvironment,
    criticality: new Criticality('low'),
  },
  {
    branchName: 'acceptance',
    buildEnvironment: Statics.buildEnvironment,
    deploymentEnvironment: Statics.acceptanceEnvironment,
    criticality: new Criticality('medium'),
  },
  {
    branchName: 'production',
    buildEnvironment: Statics.buildEnvironment,
    deploymentEnvironment: Statics.productionEnvironment,
    criticality: new Criticality('high'),
  },
];

/**
 * Retrieve a configuration object by passing a branch string
 *
 * **NB**: This retrieves the subobject with key `branchName`, not
 * the subobject containing the `branchName` as the value of the `branch` key
 *
 * @param branchName the branch for which to retrieve the environment
 * @returns the configuration object for this branch
 */
export function getConfiguration(branchName: string): Configuration {
  const config = configurations.find((configuration) => configuration.branchName == branchName);
  if (!config) {
    throw Error(`No configuration found for branch name ${branchName}`);
  }
  return config
}

/**
 * Based on the environment find the branch to build.
 * Options are in decreasing priority:
 * 1. BRANCH_NAME (set in AWS builds)
 * 2. GITHUB_BASE_REF (set in github PR workflow executions)
 * 3. defaultBanchToBuild that is provided as a parameter
 */
export function getBranchToBuild(defaultBanchToBuild: string) {

  const branchOptions = configurations.map(config => config.branchName);
  const githubBaseBranchName = process.env.GITHUB_BASE_REF;
  const environmentBranchName = process.env.BRANCH_NAME;

  // Low priority keep branch undefined
  let build = defaultBanchToBuild;

  // Midium priority branch name is set by github and is a valid option
  if (githubBaseBranchName && branchOptions.includes(githubBaseBranchName)) {
    build = githubBaseBranchName;
  }

  // High prioroty if BRANCH_NAME env variable is set use it
  build = environmentBranchName ?? build;

  return build;
}