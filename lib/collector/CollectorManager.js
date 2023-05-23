import { Collector } from "./Collector.js";

export class CollectorManager {
  constructor(exchangesConfig, dbConfig) {
    this.exchangesConfig = exchangesConfig;
    this.collectors = [];
    this.dbConfig = dbConfig

    this.#initCollectors();
  }

  start() {
    this.#runCollectors();
  }

  stop() {
    this.#stopCollectors();
  }

  #initCollectors() {
    const { exchangesConfig, collectors, dbConfig } = this;

    for (const exchange in exchangesConfig) {
      for (const market of exchangesConfig[exchange].markets) {
        const collector = new Collector({ exchange, market }, dbConfig);
        collectors.push(collector);
      }
    }
  }

  #runCollectors() {
    const { collectors } = this;

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
