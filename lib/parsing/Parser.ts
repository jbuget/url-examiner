import {createReadStream} from 'fs';
import readline from 'readline';
import {OptionValues} from 'commander';
import Line from './Line.js';
import { logger } from '../tools/Logger.js';

export default class Parser {

  private readonly _options: OptionValues;

  separator: string;

  constructor(options: OptionValues) {
    this._options= options;
    this.separator = options.separator ? options.separator : ';';
  }

  parse(file: string): Promise<Line[]> {
    return new Promise<Line[]>((resolve, reject) => {
      logger.info('--------------------------------------------------------------------------------');
      logger.info('Phase: "Parsing"');
      logger.info(` - file: ${file}`);
      logger.info(` - separator: ${this.separator}`);
      logger.info();

      const hrStart: [number, number] = process.hrtime();

      let index: number = 1;
      const lines: Line[] = [];

      const rl = readline.createInterface({
        input: createReadStream(file),
      });

      rl.on('line', (rawLine) => {
        logger.info(`  ${rawLine}`);
        let reference: string, url: string;
        [reference, url] = rawLine.split(this.separator);
        const line = new Line(index++, rawLine, reference, url);
        lines.push(line);
      });

      rl.on('close', () => {
        logger.info();
        const hrEnd: [number, number] = process.hrtime(hrStart);
        logger.info(`Execution time (hr): ${hrEnd[0]}s ${hrEnd[1] / 1000000}ms`);
        logger.info();

        resolve(lines);
      });
    })
  }
}
