import { LambdaRuntime } from 'projen/lib/awscdk';

export class Defaults {
  static readonly DEFAULT_NODE_VERSION = '22';
  static readonly DEFAULT_LAMBDA_RUNTIME = LambdaRuntime.NODEJS_24_X;
  static readonly DEFAULT_LICENSE = 'EUPL-1.2';
}