export class Collector {
  constructor({ exchange, market }) {
    this.exchange = exchange;
    this.market = market;
  }

  start() {
    this.interval = setInterval(() => {
        console.log(this.exchange, this.market);
    }, 1000);
  }

  stop() {
    clearInterval(this.interval)
  }
}
