const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class ArtilleryRunner {
    static SCENARIOS_DIR = path.join(__dirname, '..', 'scenarios');

    constructor(logger) {
        this.logger = logger;
    }

    async execute(env) {
        try {
            const scenarios = await fs.readdir(ArtilleryRunner.SCENARIOS_DIR, {
                withFileTypes: true,
            });

            for (const scenario of scenarios) {
                await this.callArtillery(scenario.name, {
                    env,
                });
            }

            this.logger.info('Artillery tests finished');
        } catch (error) {
            this.logger.error({
                message: `Error executing artillery tests`,
                error,
            });
        }
    }

    async callArtillery(scenario, { env }) {
        return this.spawn(
            './node_modules/.bin/artillery',
            [
                'run',
                '-e',
                env.TEST_ENV,
                path.join(ArtilleryRunner.SCENARIOS_DIR, scenario),
            ],
            {
                env,
                stdio: 'inherit',
            },
        );
    }

    async spawn(command, args, options) {
        return new Promise((resolve, reject) => {
            const cp = spawn(command, args, options);

            cp.on('close', (code) => {
                if (code !== 0) {
                    this.logger.error(
                        `Artillery process failed with code ${code}`,
                    );
                    reject();
                } else {
                    this.logger.info(
                        `Artillery test finished with exit code ${code}`,
                    );
                    resolve();
                }
            });
        });
    }
}

module.exports = ArtilleryRunner;
