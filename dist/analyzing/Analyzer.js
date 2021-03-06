"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const p_map_1 = __importDefault(require("p-map"));
const AnalyzedLine_1 = __importDefault(require("./AnalyzedLine"));
const HttpClient_1 = require("../tools/HttpClient");
const Logger_1 = require("../tools/Logger");
const PluginRegistry_1 = require("../plugins/PluginRegistry");
class Analyzer {
    constructor(options, httpClient) {
        this._options = options;
        this.bulk = parseInt(options.bulk) || 10;
        this.delay = options.delay;
        this.timeout = parseInt(options.timeout) || 1000;
        this._httpClient = httpClient || new HttpClient_1.HttpClient();
        if (options.timeout) {
            this._httpClient.timeout = options.timeout;
        }
        if (options.headers) {
            this.headers = options.headers.reduce((result, header) => {
                const separatorIndex = header.indexOf(':');
                const headerName = header.substr(0, separatorIndex).trim();
                const headerValue = header.substr(separatorIndex + 1, header.length - 1).trim();
                if (headerName && headerValue) {
                    result[headerName] = headerValue;
                }
                return result;
            }, {});
            this._httpClient.headers = this.headers;
        }
    }
    _sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    async _analyzeSingleLine(line, analyzedLines) {
        const analyzedLine = new AnalyzedLine_1.default(line);
        for (const check of PluginRegistry_1.registry.preHttpChecks) {
            await check.check(line, analyzedLine);
        }
        if (!analyzedLine.error) {
            try {
                const response = await this._httpClient.head(line.url);
                for (const check of PluginRegistry_1.registry.httpChecks) {
                    await check.check(response, analyzedLine);
                }
            }
            catch (err) {
                analyzedLine.markInError('HTTP_ERROR', err.message);
            }
            finally {
                if (this.delay) {
                    await this._sleep(this.delay);
                }
            }
        }
        if (!analyzedLine.error) {
            analyzedLine.markInSuccess();
        }
        analyzedLines.push(analyzedLine);
        if (!analyzedLine.error) {
            Logger_1.logger.info(chalk_1.default.cyan(`${analyzedLine.index}.`) + ' ' + chalk_1.default.green(`${analyzedLine.raw}`));
        }
        else {
            Logger_1.logger.info(chalk_1.default.cyan(`${analyzedLine.index}.`) +
                ' ' +
                chalk_1.default.red(`${analyzedLine.raw}`) +
                ' ' +
                chalk_1.default.yellow(`[${analyzedLine.error}]`));
        }
        return analyzedLine;
    }
    async analyze(lines) {
        Logger_1.logger.info('--------------------------------------------------------------------------------');
        Logger_1.logger.info('Phase: "Analyzing"');
        Logger_1.logger.info(`  - lines: ${lines.length}`);
        Logger_1.logger.info(`  - bulk: ${this.bulk}`);
        Logger_1.logger.info(`  - delay: ${this.delay}`);
        Logger_1.logger.info(`  - headers: ${this.headers}`);
        Logger_1.logger.info(`  - timeout: ${this.timeout}`);
        Logger_1.logger.info();
        const hrStart = process.hrtime();
        const analyzedLines = [];
        await (0, p_map_1.default)(lines, (line) => this._analyzeSingleLine(line, analyzedLines), { concurrency: this.bulk });
        Logger_1.logger.info();
        const hrEnd = process.hrtime(hrStart);
        Logger_1.logger.info(`Execution time (hr): ${hrEnd[0]}s ${hrEnd[1] / 1000000}ms`);
        Logger_1.logger.info();
        return analyzedLines;
    }
}
exports.default = Analyzer;
//# sourceMappingURL=Analyzer.js.map