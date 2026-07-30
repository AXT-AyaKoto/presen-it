import { spawn } from "node:child_process";
import { consola } from "consola";
import puppeteer from "puppeteer";

async function canLaunchChrome(): Promise<boolean> {
    try {
        const executablePath = await puppeteer.executablePath();
        const browser = await puppeteer.launch({
            headless: true,
            executablePath,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        await browser.close();
        return true;
    } catch {
        return false;
    }
}

function run(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: "inherit",
            shell: process.platform === "win32",
        });
        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
            }
        });
    });
}

/**
 * Ensure Puppeteer's Chrome is available. Downloads on demand (no postinstall).
 */
export async function ensureChrome(): Promise<string> {
    if (await canLaunchChrome()) {
        return puppeteer.executablePath();
    }

    consola.info("Chrome for Testing not found. Downloading for PDF/overflow checks…");
    try {
        await run("pnpm", ["exec", "puppeteer", "browsers", "install", "chrome"]);
    } catch {
        await run("npx", ["--yes", "puppeteer", "browsers", "install", "chrome"]);
    }

    if (!(await canLaunchChrome())) {
        throw new Error(
            "Failed to install Chrome for Testing. Run: pnpm exec puppeteer browsers install chrome",
        );
    }

    return puppeteer.executablePath();
}

export async function launchPresenitBrowser() {
    const executablePath = await ensureChrome();
    return puppeteer.launch({
        headless: true,
        executablePath,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
}
