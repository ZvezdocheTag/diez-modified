import {Assembler, TargetOutput} from '@diez/compiler-core';
import {ensureDir, readFileSync, writeFile} from 'fs-extra';
import {dirname} from 'path';

/**
 * A header prefix to be used in all generated source files.
 */
const headerPrefix = `// This file was generated with Diez - https://diez.org
// Do not edit this file directly.

`;

/**
 * A buffer variant of the header prefix for faster streaming I/O operations on source file copies.
 */
const headerPrefixBuffer = Buffer.from(headerPrefix);

/**
 * A base class our assembler implementations should inherit from.
 */
export abstract class BaseAssembler<T extends TargetOutput> implements Assembler<T> {
  constructor (readonly output: T) {}

  abstract async addCoreFiles (): Promise<void | void[]>;

  async writeFile (destinationPath: string, contents: string | Buffer) {
    await ensureDir(dirname(destinationPath));
    if (Buffer.isBuffer(contents)) {
      return writeFile(
        destinationPath,
        Buffer.concat([headerPrefixBuffer, contents]),
      );
    }
    return writeFile(
      destinationPath,
      `${headerPrefix}${contents}`,
    );
  }

  async copyFile (sourcePath: string, destinationPath: string) {
    await ensureDir(dirname(destinationPath));
    return writeFile(
      destinationPath,
      Buffer.concat([headerPrefixBuffer, readFileSync(sourcePath)]),
    );
  }
}
