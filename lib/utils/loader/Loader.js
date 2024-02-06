class Loader {
    constructor(message, durationMs) {
        this.message = message;
        this.durationMs = durationMs;

        this.spinner = ['|', '/', '-', '\\'];
        this.progressBarLength = 20;
        this.spinnerInterval = 250;

        this.isRunning = false;
        this.timePassed = 0;
        this.currentSpinnerIndex = 0;

        this.updateInterval = this.durationMs / this.progressBarLength;
    }

    async startLoading() {
        return new Promise((resolve, reject) => {
            if (this.isRunning) {
                return reject(new Error('Loader is already running.'));
            }

            this.#initializeLoading();

            setTimeout(async () => {
                await this.#finishLoading();

                resolve();
            }, this.durationMs);
        });
    }

    #initializeLoading() {
        this.isRunning = true;

        this.spinnerIntervalId = setInterval(
            () => this.#updateSpinner(),
            this.spinnerInterval,
        );
        this.progressBarIntervalId = setInterval(
            () => this.#updateProgressBar(),
            this.updateInterval,
        );

        process.stdout.write('\n');
    }

    #updateSpinner() {
        this.currentSpinnerIndex =
            (this.currentSpinnerIndex + 1) % this.spinner.length;

        this.#displaySpinnerAndMessage();
    }

    #updateProgressBar() {
        this.timePassed += this.updateInterval;

        this.#displayProgressBar();
    }

    #getProgressBar() {
        const completed = Math.floor(
            (this.timePassed / this.durationMs) * this.progressBarLength,
        );
        const remaining = this.progressBarLength - completed;

        return '[' + '='.repeat(completed) + ' '.repeat(remaining) + ']';
    }

    #displaySpinnerAndMessage() {
        const percentage = ((this.timePassed / this.durationMs) * 100).toFixed(
            0,
        );

        process.stdout.write(
            `\r${this.spinner[this.currentSpinnerIndex]} ${
                this.message
            } ${percentage}%`,
        );
    }

    #displayProgressBar() {
        process.stdout.write(`\x1B[1A\r${this.#getProgressBar()}\x1B[1B`);
    }

    async #finishLoading() {
        return new Promise((resolve) => {
            clearInterval(this.spinnerIntervalId);
            clearInterval(this.progressBarIntervalId);

            setTimeout(
                () => {
                    process.stdout.write(`\x1B[1A\r\x1B[K`);
                    process.stdout.write(`\x1B[1B\r\x1B[K`);
                    process.stdout.write(`${this.message} 100% Done!\n`);

                    this.isRunning = false;

                    resolve();
                },
                Math.max(this.updateInterval, this.spinnerInterval),
            );
        });
    }
}

export default Loader;
