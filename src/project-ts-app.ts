import {
  TypeScriptAppProject,
  TypeScriptProjectOptions,
} from 'projen/lib/typescript';
import {
  GemeenteNijmegenOptions,
  setDefaultValues,
  setupSharedConfiguration,
} from './shared';

export interface GemeenteNijmegenTsAppOptions
  extends TypeScriptProjectOptions, GemeenteNijmegenOptions {}

/**
 * A GemeenteNijmegen projen project type for TypeScript applications.
 *
 * @pjid ts-app
 */
export class GemeenteNijmegenTsApp extends TypeScriptAppProject {
  private readonly options: GemeenteNijmegenTsAppOptions;

  constructor(options: GemeenteNijmegenTsAppOptions) {
    options = setDefaultValues(options);
    /**
     * Construct the actual projen project
     */
    super(options);

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
