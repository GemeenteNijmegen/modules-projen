export class Statics {

  static readonly projectName = '<project-name>';

  static readonly ssmDummyParameter = '/${Statics.projectName}/dummy/parameter';

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
  static readonly accountHostedzonePath = '';
  static readonly accountHostedzoneName = '';
  static readonly accountHostedzoneId = '';

}