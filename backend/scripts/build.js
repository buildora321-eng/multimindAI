import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([".git", "generated", "node_modules"]);

const collectJavaScriptFiles = (directory) => {
    const files = [];

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!ignoredDirectories.has(entry.name)) {
                files.push(...collectJavaScriptFiles(path.join(directory, entry.name)));
            }
        } else if (entry.isFile() && entry.name.endsWith(".js")) {
            files.push(path.join(directory, entry.name));
        }
    }

    return files;
};

const sourceFiles = collectJavaScriptFiles(backendRoot);
let failed = false;

for (const sourceFile of sourceFiles) {
    const result = spawnSync(process.execPath, ["--check", sourceFile], {
        cwd: backendRoot,
        stdio: "inherit"
    });

    if (result.error) {
        console.error(`Could not check ${path.relative(backendRoot, sourceFile)}: ${result.error.message}`);
        failed = true;
    } else if (result.status !== 0) {
        failed = true;
    }
}

if (failed) {
    process.exitCode = 1;
} else {
    console.log(`Backend build check passed (${sourceFiles.length} JavaScript files).`);
}
