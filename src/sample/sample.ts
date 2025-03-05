import { Project, SampleFile } from 'projen';
import { ConfigurationFileText, MainFileText, MainStackText, MainStageText, ParametersText, PipelineFileText, StaticsFileText } from './TemplateText';

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
      contents: MainFileText,
    });
  }
}

export class ConfigurationFile extends SampleFile {
  constructor(scope: Project) {
    super(scope, 'src/Configuration.ts', {
      contents: ConfigurationFileText,
    });
  }
}

export class ParametersFile extends SampleFile {
  constructor(scope: Project) {
    super(scope, 'src/Parameters.ts', {
      contents: ParametersText,
    });
  }
}

export class MainStageFile extends SampleFile {
  constructor(scope: Project) {
    super(scope, 'src/MainStage.ts', {
      contents: MainStageText,
    });
  }
}

export class MainStackFile extends SampleFile {
  constructor(scope: Project) {
    super(scope, 'src/MainStack.ts', {
      contents: MainStackText,
    });
  }
}

export class PipelineStackFile extends SampleFile {
  constructor(scope: Project) {
    super(scope, 'src/PipelineStack.ts', {
      contents: PipelineFileText,
    });
  }
}

export class StaticsFile extends SampleFile {
  constructor(scope: Project) {
    let text = StaticsFileText.replace('<project-name>', scope.name);
    super(scope, 'src/Statics.ts', {
      contents: text,
    });
  }
}