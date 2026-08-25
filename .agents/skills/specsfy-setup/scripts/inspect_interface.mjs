#!/usr/bin/env node
/** Resume a stack de interface e as superfícies atuais sem alterar o projeto. */
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const project = resolve(args.includes("--project") ? args[args.indexOf("--project") + 1] : process.cwd());
const ignored = new Set([".git", "node_modules", "dist", "build", ".next", ".astro", "coverage"]);

async function json(path) {
  try {
    const value = JSON.parse(await readFile(path, "utf8"));
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

async function files(path, listed = []) {
  if (!existsSync(path) || listed.length >= 80) return listed;
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (ignored.has(entry.name) || listed.length >= 80) continue;
    const target = join(path, entry.name);
    if (entry.isDirectory()) await files(target, listed);
    else listed.push(relative(project, target));
  }
  return listed;
}

const packageJson = await json(join(project, "package.json"));
const composer = await json(join(project, "composer.json"));
const packages = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) };
const composerPackages = { ...(composer.require ?? {}), ...(composer["require-dev"] ?? {}) };
const selected = (names) => names.filter((name) => name in packages || name in composerPackages);
const sourceFiles = await files(project);
const has = (path) => existsSync(join(project, path));
const routeRoots = ["src/app", "src/pages", "app", "pages", "resources/js/Pages", "routes"];
const componentRoots = ["src/components", "components", "resources/js/Components", "app/components"];
const routes = sourceFiles.filter((path) => routeRoots.some((root) => path.startsWith(`${root}/`))).slice(0, 40);
const components = sourceFiles.filter((path) => componentRoots.some((root) => path.startsWith(`${root}/`))).slice(0, 40);

const report = {
  project,
  frameworks: selected(["laravel/framework", "next", "astro", "react", "vue", "svelte", "@inertiajs/react", "@inertiajs/vue3"]),
  routing: selected(["next", "react-router-dom", "@inertiajs/react", "@inertiajs/vue3"]).concat(has("routes/web.php") ? ["routes/web.php"] : []),
  styling: selected(["tailwindcss", "@tailwindcss/vite", "styled-components", "@emotion/react", "sass"]).concat(["tailwind.config.js", "tailwind.config.ts", "components.json"].filter(has)),
  components: selected(["@radix-ui/react-dialog", "@base-ui-components/react", "class-variance-authority", "@headlessui/react"]).concat(has("components.json") ? ["shadcn/ui"] : []),
  forms: selected(["react-hook-form", "@tanstack/react-form", "formik", "zod", "yup"]),
  tests: selected(["vitest", "@playwright/test", "cypress", "@testing-library/react", "pestphp/pest"]),
  current_routes: routes,
  current_components: components,
};

console.log(JSON.stringify(report, null, 2));
