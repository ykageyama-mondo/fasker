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
 * **You will need to manually change the projenCommand to `fasker` in your project constructor props.**
 *
 * @example
 * const project = new NodeProject({
 *  ...
 *  projenCommand: 'fasker',
 *  ...
 * });
 *
 * new Fasker(project);
 */
export class Fasker extends Component {
  constructor(project: NodeProject, options?: FaskerOptions) {
    super(project);
    const version = options?.version ?? 'latest';
    project.addDevDeps(`fasker@${version}`);

    project.gitignore.exclude('.fasker-cache');
  }

  synthesize(): void {}
}
