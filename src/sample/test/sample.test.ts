import { synthSnapshot } from 'projen/lib/util/synth';
import { GemeenteNijmegenCdkApp } from '../../project-cdk-app';
import { bundleTemplates } from '../bundletemplates';

test('bundle', () => {
  bundleTemplates();
});

describe('GemeenteNijmegenCdkApp tests', () => {

  const project = new GemeenteNijmegenCdkApp({
    cdkVersion: '2.10.0',
    defaultReleaseBranch: 'main',
    name: 'TestProjectV1',
  });
  const snapshot = synthSnapshot(project);

  test('Statics file is created', () => {
    const expected = `static readonly projectName = '${project.name}';`;
    expect(snapshot['src/Statics.ts']).toContain(expected);
  });

  test('Main file is overwritten', () => {
    expect(snapshot['src/index.ts']).toContain('replace old main file with this file!');
  });

  test('Configuration file is created', () => {
    expect(snapshot['src/Configuration.ts']).toContain('export function getBranchToBuild(');
    expect(snapshot['src/Configuration.ts']).toContain('export function getConfiguration(');
  });

  test('PipelineStack file is created', () => {
    expect(snapshot['src/PipelineStack.ts']).toContain('new ParameterStage(');
    expect(snapshot['src/PipelineStack.ts']).toContain('new MainStage(');
  });

  test('MainStage file is created', () => {
    expect(snapshot['src/MainStage.ts']).toContain('class MainStage');
  });

  test('MainStack file is created', () => {
    expect(snapshot['src/MainStack.ts']).toContain('class MainStack');
  });


});