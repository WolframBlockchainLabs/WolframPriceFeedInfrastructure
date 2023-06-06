import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { spawn } from "child_process";

import config from "../config.cjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

(async function main() {
  for (const exchange in config.collectorManager.exchanges) {
    const child = spawn("node", [
      resolve(__dirname, "collectorRunner.js"),
      `--exchange=${exchange}`,
    ]);

    child.stdout.on("data", (data) => {
      console.log(
        `child.stdout --${exchange}--`,
        JSON.stringify(data.toString(), null, 2)
      );
    });

    child.stderr.on("data", (data) => {
      console.log(
        `child.stderr --${exchange}--`,
        JSON.stringify(data.toString(), null, 2)
      );
    });

    child.on("error", (data) => {
      console.log(
        `child.on[error] --${exchange}--`,
        JSON.stringify(data, null, 2)
      );
    });

    // child.on("close", (data) => {
    //   console.log(
    //     `child.on[close] --${exchange}--`,
    //     JSON.stringify(data, null, 2)
    //   );
    // });
  }
})();


    // "collector:run": "pm2 node ./lib/collectors/bootstrap.js --cron-restart='* * * * *'",