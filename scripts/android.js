#!/usr/bin/env node
/**
 * Starts the Android emulator (if not already running), waits for it to fully
 * boot, then launches the Expo dev server targeting Android.
 */

const { execSync, spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const EMULATOR_EXE = 'C:\\Android\\emulator\\emulator.exe';
const ADB_EXE = 'C:\\Android\\platform-tools\\adb.exe';
const BOOT_TIMEOUT_MS = 120_000; // 2 minutes
const POLL_INTERVAL_MS = 3_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', ...opts }).trim();
  } catch {
    return '';
  }
}

function isEmulatorRunning() {
  const devices = run(`"${ADB_EXE}" devices`);
  return devices.includes('emulator-');
}

function isFullyBooted() {
  const result = run(`"${ADB_EXE}" -e shell getprop sys.boot_completed`);
  return result.trim() === '1';
}

function getAvdName() {
  const list = run(`"${EMULATOR_EXE}" -list-avds`);
  const avds = list.split('\n').map((s) => s.trim()).filter(Boolean);
  if (avds.length === 0) {
    console.error('❌  No AVDs found. Create one in Android Studio first.');
    process.exit(1);
  }
  return avds[0]; // use first available AVD
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Verify emulator exe exists
  if (!fs.existsSync(EMULATOR_EXE)) {
    console.error(`❌  Emulator not found at ${EMULATOR_EXE}`);
    console.error('    Update EMULATOR_EXE path in scripts/android.js');
    process.exit(1);
  }

  if (isEmulatorRunning()) {
    console.log('✅  Emulator already running — launching app...');
  } else {
    const avd = getAvdName();
    console.log(`🚀  Starting emulator: ${avd}`);

    // Launch emulator detached so this script doesn't wait on it
    const emu = spawn(EMULATOR_EXE, ['-avd', avd], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    });
    emu.unref();

    // Wait for ADB to detect the emulator
    console.log('⏳  Waiting for emulator to appear on ADB...');
    const start = Date.now();
    while (!isEmulatorRunning()) {
      if (Date.now() - start > BOOT_TIMEOUT_MS) {
        console.error('❌  Timed out waiting for emulator to start.');
        process.exit(1);
      }
      await sleep(POLL_INTERVAL_MS);
      process.stdout.write('.');
    }
    process.stdout.write('\n');

    // Wait for Android to finish booting
    console.log('⏳  Waiting for Android to finish booting...');
    while (!isFullyBooted()) {
      if (Date.now() - start > BOOT_TIMEOUT_MS) {
        console.error('❌  Timed out waiting for Android boot.');
        process.exit(1);
      }
      await sleep(POLL_INTERVAL_MS);
      process.stdout.write('.');
    }
    process.stdout.write('\n');
    console.log('✅  Emulator booted!');

    // Extra pause for the launcher to settle
    await sleep(2000);
  }

  // Launch Expo targeting Android
  console.log('📱  Launching Expo...\n');
  const expo = spawn('cmd', ['/c', 'npx', 'expo', 'start', '--android'], {
    stdio: 'inherit',
    shell: false,
  });

  expo.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
