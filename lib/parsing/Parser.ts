import chalk from 'chalk';
import {createReadStream} from 'fs';
import readline from 'readline';
import {OptionValues} from 'commander';
import Line from './Line';
import { logger } from '../tools/Logger';

export default class Parser {

  private readonly _options: OptionValues;

  separator: string;
  from?: number;
  to?: number;

  constructor(options: OptionValues) {
    this._options= options;
    this.separator = options.separator ? options.separator : ';';
    this.from = options.from;
    this.to = options.to;
  }

  parse(file: string): Promise<Line[]> {
    return new Promise<Line[]>((resolve, reject) => {
      logger.info('--------------------------------------------------------------------------------');
      logger.info('Phase: "Parsing"');
      logger.info(` - file: ${file}`);
      logger.info(` - from: ${this.from}`);
      logger.info(` - separator: ${this.separator}`);
      logger.info(` - to: ${this.to}`);
      logger.info();

      const hrStart: [number, number] = process.hrtime();

      let index = 1;
      const lines: Line[] = [];

      const rl = readline.createInterface({
        input: createReadStream(file),
      });

      rl.on('line', (rawLine) => {
        let mustAddLine = true;

        if (this.from && index < this.from) mustAddLine = mustAddLine && false;
        if (this.to && index > this.to) mustAddLine = mustAddLine && false;

        if (mustAddLine) {
          logger.info(`  ${rawLine}`);
          const line = new Line(index, rawLine, this.separator);
          lines.push(line);
        } else {
          logger.info(`  ${chalk.gray(rawLine)}`);
        }

        index++;
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
