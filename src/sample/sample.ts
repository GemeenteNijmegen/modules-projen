import { Project, SampleFile } from 'projen';
import { Configuration, Main, MainStack, MainStage, Parameters, PipelineStack, Statics } from './TemplateText';

export class GemeenteNijmegenSampleFiles {
  constructor(scope: Project) {
    new MainFile(scope);
    new StaticsFile(scope);
    new ConfigurationFile(scope);
    new PipelineStackFile(scope);
    new MainStageFile(scope);
    new MainStackFile(scope);
  }
}

export class MainFile extends SampleFile {
  constructor(scope: Project) {
    super(scope, 'src/index.ts', {
      contents: Main,
    });
  }
}

export class ConfigurationFile extends SampleFile {
  constructor(scope: Project) {
    super(scope, 'src/Configuration.ts', {
      contents: Configuration,
    });
  }
}

export class ParametersFile extends SampleFile {
  constructor(scope: Project) {
    super(scope, 'src/Parameters.ts', {
      contents: Parameters,
    });
  }
}

export class MainStageFile extends SampleFile {
  constructor(scope: Project) {
    super(scope, 'src/MainStage.ts', {
      contents: MainStage,
    });
  }
}

export class MainStackFile extends SampleFile {
  constructor(scope: Project) {
    super(scope, 'src/MainStack.ts', {
      contents: MainStack,
    });
  }
}

export class PipelineStackFile extends SampleFile {
  constructor(scope: Project) {
    super(scope, 'src/PipelineStack.ts', {
      contents: PipelineStack,
    });
  }
}

export class StaticsFile extends SampleFile {
  constructor(scope: Project) {
    let text = Statics.replace('<project-name>', scope.name);
    super(scope, 'src/Statics.ts', {
      contents: text,
    });
  }
}