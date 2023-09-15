const { spawn } = require('child_process');
const fs = require('fs').promises;

class ArtilleryRunner {
    constructor(logger) {
        this.logger = logger;
    }

    async execute(PORT) {
        try {
            const scenarios = await fs.readdir(`${__dirname}/scenarios`, {
                withFileTypes: true,
            });

            for (const scenario of scenarios) {
                await this.callArtillery(scenario.name, {
                    env: {
                        PORT,
                    },
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
            ['run', `${__dirname}/scenarios/get_collected_data.yml`],
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
