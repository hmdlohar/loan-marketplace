import { syncSDK } from "./syncSDK";
import { generateCollectionTypes } from "./generateCollectionTypes";

async function run() {
  const cmd = process.argv[2];
  if (cmd === "syncSDK") {
    await syncSDK();
  } else if (cmd === "generateTypes") {
    generateCollectionTypes();
  } else {
    console.log(`Unknown command: ${cmd}. Available: syncSDK, generateTypes`);
  }
}

run().catch((ex) => console.error(ex.message));
