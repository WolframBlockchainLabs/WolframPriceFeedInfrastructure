import { Collector } from "./Collector.js";

export class CollectorManager {
  constructor(exchangesConfig) {
    this.exchangesConfig = exchangesConfig;
    this.collectors = [];

    this.#initCollectors();
  }

  start() {
    this.#runCollectors();

  }

  stop() {
    this.#stopCollectors();
  }

  #initCollectors() {
    const { exchangesConfig, collectors } = this;

    console.log(exchangesConfig);

    for (const exchange in exchangesConfig) {
      for (const market in exchange.markets) {
        const collector = new Collector({ exchange, market });
        collectors.push(collector);
      }
    }
  }

  #runCollectors() {
    const { collectors } = this;

    console.log(collectors);

    for (const collector of collectors) {
      collector.start();
    }
  }

  #stopCollectors() {
    const { collectors } = this;

    for (const collector of collectors) {
      collector.stop();
    }
  }
}
