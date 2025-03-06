// Note this file is auto-generated
export const Configuration = `import { Criticality } from '@gemeentenijmegen/aws-constructs';
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
 * **NB**: This retrieves the subobject with key \`branchName\`, not
 * the subobject containing the \`branchName\` as the value of the \`branch\` key
 *
 * @param branchName the branch for which to retrieve the environment
 * @returns the configuration object for this branch
 */
export function getConfiguration(branchName: string): Configuration {
  const config = configurations.find((configuration) => configuration.branchName == branchName);
  if (!config) {
    throw Error(\`No configuration found for branch name \${branchName}\`);
  }
  return config
}

/**
 * Based on the environment find the branch to build.
 * Options are in decreasing priority:
 * 1. BRANCH_NAME (set in AWS builds)
 * 2. GITHUB_BASE_REF (set in github PR workflow executions)
 * 3. defaultBanchToBuild that is provided as a parameter
 * 3. undefined (no value provided so leave it up to the logic in the main file)
 */
export function getBranchToBuild(defaultBanchToBuild?: string) {

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
}`;
export const Main = `import { App } from 'aws-cdk-lib';
import { getBranchToBuild, getConfiguration } from './Configuration';
import { PipelineStack } from './PipelineStack';
import { Statics } from './Statics';

const branchToBuild = getBranchToBuild('acceptance');
const configuration = getConfiguration(branchToBuild);
console.info('Building branch:', branchToBuild);

// TODO replace old main file with this file!

const app = new App();

const stackName = \`\${Statics.projectName}-pipeline-\${configuration.branchName}\`;
new PipelineStack(app, stackName, {
  env: configuration.buildEnvironment,
  configuration: configuration,
});

app.synth();`;
export const MainStack = `import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';

interface MainStackProps extends StackProps, Configurable { }

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, private readonly props: MainStackProps) {
    super(scope, id, props);

    // TODO add resources here

  }
}`;
export const MainStage = `import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { MainStack } from './MainStack';

interface MainStageProps extends StageProps, Configurable { }

/**
 * Main cdk app stage
 * TODO you probably want to rename this stage
 */
export class MainStage extends Stage {

  constructor(scope: Construct, id: string, props: MainStageProps) {
    super(scope, id, props);
    Aspects.of(this).add(new PermissionsBoundaryAspect());

    /**
     * Main stack of this project
     * TODO you probably want to rename this stack
     */
    new MainStack(this, 'stack', { // Translates to mijn-services-stack
      env: props.configuration.deploymentEnvironment,
      configuration: props.configuration,
    });

  }

}`;
export const Parameters = `import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Stack, Stage, StageProps, Tags } from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { Statics } from './Statics';

export interface ParameterStageProps extends StageProps, Configurable { }

/**
 * Stage for creating SSM parameters. This needs to run
 * before stages that use them.
 */
export class ParameterStage extends Stage {
  constructor(scope: Construct, id: string, props: ParameterStageProps) {
    super(scope, id, props);
    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);
    Aspects.of(this).add(new PermissionsBoundaryAspect());
    new ParameterStack(this, 'stack');
  }
}

/**
 * Stack that creates ssm parameters for the application.
 * These need to be present before stacks that use them.
 */
export class ParameterStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    new StringParameter(this, 'ssm-dummy', {
      stringValue: '-',
      parameterName: Statics.ssmDummyParameter,
    });

  }
}`;
export const PipelineStack = `import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, CfnParameter, Stack, StackProps, Tags, pipelines } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { MainStage } from './MainStage';
import { ParameterStage } from './parameters';
import { Statics } from './Statics';

export interface PipelineStackProps extends StackProps, Configurable { }

/**
 * The pipeline runs in a build environment, and is responsible for deploying
 * Cloudformation stacks to the workload account. The pipeline will first build
 * and synth the project, then deploy (self-mutating if necessary).
 */
export class PipelineStack extends Stack {

  constructor(scope: Construct, id: string, private readonly props: PipelineStackProps) {
    super(scope, id, props);
    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);
    Aspects.of(this).add(new PermissionsBoundaryAspect());

    /**
     * INSTRUCTIONS:
     * On first deploy, providing a connectionArn param to \`cdk deploy\` is required, so the
     * codestarconnection can be setup. This connection is responsible for further deploys
     * triggering from a commit to the specified branch on Github.
     */
    const connectionArn = new CfnParameter(this, 'connectionArn');
    const source = this.connectionSource(connectionArn);

    const pipeline = this.pipeline(source);

    // Parameter stage
    const parameters = new ParameterStage(this, \`\${Statics.projectName}-parameters\`, {
      env: this.props.configuration.deploymentEnvironment,
      configuration: this.props.configuration,
    });
    pipeline.addStage(parameters);

    // API stage
    const api = new MainStage(this, Statics.projectName, {
      env: this.props.configuration.deploymentEnvironment,
      configuration: this.props.configuration,
    });

    pipeline.addStage(api);

  }

  pipeline(source: pipelines.CodePipelineSource): pipelines.CodePipeline {
    const dockerHub = new Secret(this, 'docker-credentials', {
      description: \`Docker credentials for \${Statics.projectName} (\${this.props.configuration.branchName})\`,
    });

    const synthStep = new pipelines.ShellStep('Synth', {
      input: source,
      env: {
        BRANCH_NAME: this.props.configuration.branchName,
      },
      commands: [
        'yarn install --frozen-lockfile',
        'npx projen build',
      ],
    });

    const pipelineName = \`\${Statics.projectName}-\${this.props.configuration.branchName}\`;
    const pipeline = new pipelines.CodePipeline(this, pipelineName, {
      pipelineName: pipelineName,
      crossAccountKeys: true,
      synth: synthStep,
      dockerCredentials: [pipelines.DockerCredential.dockerHub(dockerHub)],
    });
    return pipeline;
  }

  /**
   * We use a codestarconnection to trigger automatic deploys from Github
   *
   * The value for this ARN can be found in the CodePipeline service under [settings->connections](https://eu-central-1.console.aws.amazon.com/codesuite/settings/connections?region=eu-central-1)
   * Usually this will be in the build-account.
   *
   * @param connectionArn the ARN for the codestarconnection.
   * @returns
   */
  private connectionSource(connectionArn: CfnParameter): pipelines.CodePipelineSource {
    return pipelines.CodePipelineSource.connection(Statics.projectRepo, this.props.configuration.branchName, {
      connectionArn: connectionArn.valueAsString,
    });
  }
}`;
export const Statics = `export class Statics {

  static readonly projectName = '<project-name>';

  static readonly ssmDummyParameter = '/\${Statics.projectName}/dummy/parameter';

  // MARK: environments
  static readonly buildEnvironment = {
    account: '',
    region: 'eu-central-1',
  }

  static readonly productionEnvironment = {
    account: '',
    region: 'eu-central-1',
  }

  static readonly acceptanceEnvironment = {
    account: '',
    region: 'eu-central-1',
  }

  static readonly developmentEnvironment = {
    account: '',
    region: 'eu-central-1',
  }

  // MARK: account hostedzone
  static readonly accountHostedzonePath = '/gemeente-nijmegen/account/hostedzone';
  static readonly accountHostedzoneName = '/gemeente-nijmegen/account/hostedzone/id';
  static readonly accountHostedzoneId = '/gemeente-nijmegen/account/hostedzone/name';

}`;