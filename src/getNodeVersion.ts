import { readFileSync } from 'fs';
import { Defaults } from './defaults';

export function getNodeVersion(): string {
  try {
    return readFileSync('.nvmrc', 'utf-8').trim();
  } catch (error: any) {
    if (error.code == 'ENOENT') {
      console.warn(`No .nvmrc present, using default node version ${Defaults.DEFAULT_NODE_VERSION}`);
      return Defaults.DEFAULT_NODE_VERSION;
    } else {
      throw error;
    }
  }

}

