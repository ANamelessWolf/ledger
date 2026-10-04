// Runs the app on an Android emulator: reuses a running one, otherwise
// launches an AVD and waits until it has finished booting.
//
// Usage (from the repo root): npm run mobile:test
// Pick a specific AVD with MOBILE_EMULATOR=<id> (see `flutter emulators`).
import { execSync, spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const mobileDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BOOT_TIMEOUT_MS = 3 * 60 * 1000;

const run = (cmd) => execSync(cmd, { cwd: mobileDir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Android emulators Flutter can currently deploy to. */
function runningEmulators() {
  const raw = run("flutter devices --machine");
  const json = raw.slice(raw.indexOf("["));
  return JSON.parse(json).filter((d) => d.emulator && d.targetPlatform.startsWith("android"));
}

/** First AVD id from `flutter emulators`, or MOBILE_EMULATOR. */
function emulatorId() {
  if (process.env.MOBILE_EMULATOR) return process.env.MOBILE_EMULATOR;
  const line = run("flutter emulators")
    .split(/\r?\n/)
    .find((l) => l.includes("•") && /•\s*android\s*$/.test(l));
  if (!line) {
    console.error("No Android emulator found. Create one in Android Studio (Device Manager) or with `flutter emulators --create`.");
    process.exit(1);
  }
  return line.split("•")[0].trim();
}

async function main() {
  let devices = runningEmulators();
  if (devices.length === 0) {
    const id = emulatorId();
    console.log(`Launching emulator ${id}…`);
    run(`flutter emulators --launch ${id}`);
    const deadline = Date.now() + BOOT_TIMEOUT_MS;
    while (devices.length === 0 || !isBooted(devices[0].id)) {
      if (Date.now() > deadline) {
        console.error("The emulator did not finish booting in time.");
        process.exit(1);
      }
      await sleep(3000);
      devices = runningEmulators();
    }
  }
  const device = devices[0];
  console.log(`Running on ${device.name} (${device.id})…`);
  const child = spawn("flutter", ["run", "-d", device.id, ...process.argv.slice(2)], {
    cwd: mobileDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}

function isBooted(deviceId) {
  try {
    return run(`adb -s ${deviceId} shell getprop sys.boot_completed`).trim() === "1";
  } catch {
    return false;
  }
}

main();
