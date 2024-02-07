import { Component } from 'projen';
import { NodeProject } from 'projen/lib/javascript';

export interface FaskerOptions {
  /**
   * The version of fasker to use.
   * @default - latest
   */
  readonly version?: string;
}

/**
 * Component to add fasker to your project.
 *
 * **You will need to manually change the projenCommand to `npx fasker` in your project constructor props.**
 *
 * @example
 * const project = new NodeProject({
 *  ...
 *  projenCommand: 'npx fasker',
 *  ...
 * });
 *
 * new Fasker(project);
 */
export class Fasker extends Component {
  private readonly version: string;
  constructor(project: NodeProject, options?: FaskerOptions) {
    super(project);
    this.version = options?.version ?? 'latest';
    project.addDevDeps(`fasker@${this.version}`);

    project.gitignore.exclude('.fasker-cache');
    if (project.projenCommand !== 'npx fasker') {
      throw new Error('Please change the projenCommand to `npx fasker`');
    }
  }
}
