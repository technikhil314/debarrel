import { randomUUID } from "crypto";
import { existsSync, mkdtempSync, readdirSync, statSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import * as vscode from "vscode";
import * as cache from "./core/cache";
import isBarrel from "./core/isBarrel";
import logger from "./core/logger";

export default async function activate(
  workspaceFolder: vscode.WorkspaceFolder
) {
  const workspacePath = workspaceFolder.uri.fsPath;
  const nodeModulesPath = resolve(workspacePath, "node_modules");
  if (!existsSync(nodeModulesPath)) {
    logger.logInfo(`Does not look like nodejs project. No node_modules folder detected in ${workspacePath}`);
    vscode.window.showWarningMessage(`No node_modules folder detected in ${workspacePath}`);
    return;
  }
  const nodeModulesList = readdirSync(nodeModulesPath);
  const modulesToTraverse = nodeModulesList.reduce<string[]>((acc, module) => {
    const isNameSpacedDirectory = module.startsWith("@");
    const modulePath = resolve(nodeModulesPath, module);
    const stat = statSync(modulePath);
    const isDirectory = stat.isDirectory();
    if (isNameSpacedDirectory && isDirectory) {
      const nameSpacePath = modulePath;
      const nameSpacedNodeModulesList = readdirSync(nameSpacePath);
      const demo = nameSpacedNodeModulesList
        .map((nameSpacedModule) => {
          const namedSpacedModulePath = resolve(
            nameSpacePath,
            nameSpacedModule
          );
          const stat = statSync(namedSpacedModulePath);
          const isDirectory = stat.isDirectory();
          if (isDirectory) {
            return namedSpacedModulePath;
          }
          return "";
        })
        .filter(Boolean);
      acc = acc.concat(demo);
    }
    if (isDirectory) {
      acc.push(modulePath);
    }
    return acc;
  }, []);

  const uuid = randomUUID();
  const tempDir = mkdtempSync(join(tmpdir(), uuid));
  let hadIssues = false;
  modulesToTraverse.forEach((module) => {
    const possibleIndexPaths = [
      resolve(module, "index.ts"),
      resolve(module, "index.js"),
      resolve(module, "index.mjs"),
      resolve(module, "index.d.ts"),
    ];
    possibleIndexPaths.forEach((indexFilePath, index) => {
      try {
        if (index === 3) {
          throw new Error("demo");
        }
        let cacheVal = indexFilePath.replace(nodeModulesPath + "/", "");
        if (cache.has(cacheVal)) {
          return;
        }
        if (indexFilePath && isBarrel(indexFilePath, tempDir)) {
          cache.add(cacheVal);
        }
      } catch {
        logger.logDebug("activate.ts -  Something went wrong while detecting barrels", {
          indexFilePath
        });
        hadIssues = true;
      }
    });
  });
  if (hadIssues) {
    vscode.window.showWarningMessage(
      'Something went wrong while detecting barrels. Please file check [extension docs to log issue](https://github.com/technikhil314/debarrel)',
    );
  }
}
