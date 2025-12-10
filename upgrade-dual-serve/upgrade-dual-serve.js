const fs = require('fs');
const path = require('path');
const fsp = require('fs/promises');
const { spawn } = require("child_process");

const repoUrl = "https://github.com/Grids-and-Guides/Dual-Serve.git";


// -------------------------------------
// step 1: validate dual-serve (bin + src)

function validateDualServeProject(projectRoot) {

    const binPath = path.join(projectRoot, "bin");
    const srcPath = path.join(projectRoot, "src");

    // check if 'bin' and 'src' folders exist
    const hasBin =
        fs.existsSync(binPath) && fs.lstatSync(binPath).isDirectory();

    const hasSrc =
        fs.existsSync(srcPath) && fs.lstatSync(srcPath).isDirectory();

    if (!hasBin) {
        console.error("Validation failed: 'bin' folder not found");
        return false;
    }

    // bin  must not be empty
    let binItems = [];

    try {
        binItems = fs.readdirSync(binPath);
    } catch (e) {
        console.error("Validation failed: cannot read 'bin' folder");
        return false;
    }

    if (!hasSrc) {
        console.error("Validation failed: 'src' folder not found");
        return false;
    }

    console.log("Dual-serve validation passed");
    return true;
}

// -------------------------------------
// run git commands

function runGit(args, options = {}) {

    return new Promise((resolve, reject) => {

        const git = spawn("git", args, {
            stdio: ["ignore", "pipe", "pipe"],
            ...options
        });

        // script reads git messages through this pipe.
        let pipeReadOut = "";
        let pipeReaderr = "";

        git.stdout.on("data", d => (pipeReadOut += d.toString()));
        git.stderr.on("data", d => (pipeReaderr += d.toString()));

        git.on("close", code => {
            if (code === 0) resolve(pipeReadOut.trim());
            else reject(new Error(pipeReaderr));
        });

    });
}

// -------------------------------------
// ensure template repo (clone or pull)

async function ensureTemplateRepo(templatePath, repoUrl) {

    const exists = fs.existsSync(templatePath);

    if (!exists) {
        console.log("Template cache not found. Cloning...");
        await runGit(["clone", "--depth=1", repoUrl, templatePath]);
        console.log("Template clone done.");
    } else {
        console.log("Template cache found. Pulling updates...");
        await runGit(["-C", templatePath, "pull", "--ff-only"]);
        console.log("Template pull done.");
    }
}

// -------------------------------------
// decide which paths should never be touched in project

function shouldSkipRelativePath(relPath) {

    const normalized = relPath.split(path.sep).join("/");

    // never touch src or anything inside src
    if (normalized === "src" || normalized.startsWith("src/")) {
        return true;
    }

    // never touch bin or anything inside bin
    if (normalized === "bin" || normalized.startsWith("bin/")) {
        return true;
    }

    // never touch .env files (.env, .env.local, .env.production, ...)
    if (normalized === ".env" || normalized.startsWith(".env")) {
        return true;
    }

    // never touch node_modules or .git from template
    const parts = normalized.split("/");
    if (parts.includes("node_modules") || parts.includes(".git")) {
        return true;
    }

    return false;
}

// -------------------------------------
// sync files from template to project
// only walk template
// never delete project files
// skip src, bin, env, node_modules, .git

async function syncTemplateToProject(templateRoot, projectRoot, baseTemplateRoot) {

    const entries = await fsp.readdir(templateRoot, { withFileTypes: true });

    for (const entry of entries) {

        const templateEntryPath = path.join(templateRoot, entry.name);

        // always relative to baseTemplateRoot (fixed root)
        const relPath = path.relative(baseTemplateRoot, templateEntryPath);

        if (shouldSkipRelativePath(relPath)) {
            console.log(`SKIP (protected): ${relPath}`);
            continue;
        }

        const targetPath = path.join(projectRoot, relPath);

        if (entry.isDirectory()) {

            // ensure target directory exists
            await fsp.mkdir(targetPath, { recursive: true });

            // recurse, but baseTemplateRoot stays same
            await syncTemplateToProject(templateEntryPath, projectRoot, baseTemplateRoot);

        } else if (entry.isFile()) {

            // ensure parent folder exists
            await fsp.mkdir(path.dirname(targetPath), { recursive: true });

            if (fs.existsSync(targetPath)) {
                console.log(`UPDATE FILE: ${relPath}`);
            } else {
                console.log(`CREATE FILE: ${relPath}`);
            }

            await fsp.copyFile(templateEntryPath, targetPath);

        } else {
            console.log(`SKIP (not file/dir): ${relPath}`);
        }
    }
}

//package.json upgrade function
async function upgradePackageJson(projectRoot, templateRoot) {
    const projectPkgPath = path.join(projectRoot, "package.json");
    const templatePkgPath = path.join(templateRoot, "package.json");

    if (!fs.existsSync(projectPkgPath)) {
        console.error("No package.json found in project");
        return;
    }
    if (!fs.existsSync(templatePkgPath)) {
        console.error("No package.json found in template repo");
        return;
    }

    const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath, "utf8"));
    const templatePkg = JSON.parse(fs.readFileSync(templatePkgPath, "utf8"));

    let updated = false;

    // upgrade scripts
    projectPkg.scripts = projectPkg.scripts || {};
    for (const [key, val] of Object.entries(templatePkg.scripts || {})) {
        if (!projectPkg.scripts[key]) {
            projectPkg.scripts[key] = val;
            console.log("Adding script:", key);
            updated = true;
        }
    }

    // upgrade dependencies
    projectPkg.dependencies = projectPkg.dependencies || {};
    for (const [key, val] of Object.entries(templatePkg.dependencies || {})) {
        if (!projectPkg.dependencies[key]) {
            projectPkg.dependencies[key] = val;
            console.log("Adding dependency:", key);
            updated = true;
        }
    }

    // upgrade devDependencies
    projectPkg.devDependencies = projectPkg.devDependencies || {};
    for (const [key, val] of Object.entries(templatePkg.devDependencies || {})) {
        if (!projectPkg.devDependencies[key]) {
            projectPkg.devDependencies[key] = val;
            console.log("Adding devDependency:", key);
            updated = true;
        }
    }

    if (updated) {
        fs.writeFileSync(
            projectPkgPath,
            JSON.stringify(projectPkg, null, 2),
            "utf8"
        );
        console.log("package.json updated");
    } else {
        console.log("package.json already up to date");
    }
}


// -------------------------------------
// main

async function main() {

    const currentProjectRoot = process.cwd();
    const upgradeFolderName = "upgrade-dual-serve";
    const templateCacheFolderName = ".dual-serve-template-cache";

    console.log(`Current project root: ${currentProjectRoot}`);
    console.log("checking dual-serve structure...");

    const validateDualServeStructure = validateDualServeProject(currentProjectRoot);

    if (!validateDualServeStructure) {
        console.error("Exiting due to invalid dual-serve project structure.");
        return;
    }

    console.log("Project is valid dual-serve project.");

    // cache template storage path
    const upgradeRoot = path.join(currentProjectRoot, upgradeFolderName);

    // inside upgrade-dual-serve folder, path to template cache
    const templatePath = path.join(upgradeRoot, templateCacheFolderName);

    if (!fs.existsSync(upgradeRoot)) {
        fs.mkdirSync(upgradeRoot, { recursive: true });
    }

    console.log("Preparing template repo cache...");

    try {
        await ensureTemplateRepo(templatePath, repoUrl);
        console.log("Template repo ready at:", templatePath);
    } catch (err) {
        console.error("Failed to prepare template repo:", err.message);
        return;
    }

    console.log("Starting file sync from template to project...");

    await syncTemplateToProject(templatePath, currentProjectRoot, templatePath);

    console.log("Upgrading package.json...");
    await upgradePackageJson(currentProjectRoot, templatePath);


    console.log("File sync completed. bin/src/.env* were not touched. Project-only files also not touched.");

    console.log("");
    console.log("Next steps (run these in your project folder):");
    console.log("1) Install dependencies if needed:");
    console.log("   npm install");
    console.log("");
    console.log("2) Build or prepare your project:");
    console.log("   Check package.json \"scripts\" and run the right build command.");
    console.log("   For example:");
    console.log("   npm run build");
    console.log("   or");
    console.log("   npm run express-build ");
    console.log("");
    console.log("Done.");
}

main();

//run command : node upgrade-dual-serve/upgrade-dual-serve.js
