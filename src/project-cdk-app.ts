import { AwsCdkTypeScriptApp, AwsCdkTypeScriptAppOptions } from 'projen/lib/awscdk';
import combine from './combine';
import { GemeenteNijmegenSampleFiles } from './sample/sample';
import { GemeenteNijmegenOptions, setDefaultValues, setupDefaultCdkOptions, setupSharedConfiguration } from './shared';

export interface GemeenteNijmegenCdkAppOptions extends AwsCdkTypeScriptAppOptions, GemeenteNijmegenOptions {
  /**
   * Enable cfn-lint in the github build workflow
   * @default true
   */
  readonly enableCfnLintOnGithub?: boolean;
}

/**
 * GemeenteNijmegenCdkApp projen project type for Gemeente Nijmegen CDK apps
 *
 * @pjid cdk-app
 */
export class GemeenteNijmegenCdkApp extends AwsCdkTypeScriptApp {

  private readonly options: GemeenteNijmegenCdkAppOptions;

  constructor(options: GemeenteNijmegenCdkAppOptions) {

    const enableCfnLintOnGithub = options.enableCfnLintOnGithub ?? true;

    options = setDefaultValues(options);
    options = setupDefaultCdkOptions(options);

    /**
     * Add lint script to projen scripts only if
     * there are no scripts or the lint script is not set
     */
    options = {
      ...options,
      scripts: {
        lint: 'cfn-lint cdk.out/**/*.template.json -i W3005 W2001',
        ...options.scripts,
      },
    };

    /**
     * Set additinal gitignore for cdk app
     */
    options = {
      ...options,
      gitignore: combine(options.gitignore,
        'test/playwright/report',
        'test/playwright/screenshots',
      ),
    };

    /**
     * Setup cfn lint for usage in github workflows
     */
    if (enableCfnLintOnGithub) {
      const setupCfnLint = {
        name: 'Setup cfn-lint',
        uses: 'scottbrenner/cfn-lint-action@v2',
      };
      const cfnLint = {
        name: 'CloudFormation lint',
        run: 'npx projen lint',
      };
      options = {
        ...options,
        workflowBootstrapSteps: combine(options.workflowBootstrapSteps, setupCfnLint),
        postBuildSteps: combine(options.postBuildSteps, cfnLint),
      };
    }

    /**
     * Construct the actual projen project
     */
    super(options);

    // Create sample files
    new GemeenteNijmegenSampleFiles(this);


    // Setup dependencies that must be included
    this.addDeps(
      '@gemeentenijmegen/aws-constructs',
    );


    /**
     * Setup all shared configuration for this project e.g.
     * validate-repository workflow, auto-merge dependencies,
     * emergency workflow.
     */
    setupSharedConfiguration(this, options);

    this.options = options;
  }

  public configuredOptions() {
    return this.options;
  }

}