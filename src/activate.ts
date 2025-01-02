import { existsSync, readdirSync, statSync } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as cache from "./core/cache";
import isBarrel from "./core/isBarrel";
import logger from "./core/logger";

export default async function activate(
  workspaceFolder: vscode.WorkspaceFolder
) {
  const workspacePath = workspaceFolder.uri.fsPath;
  const nodeModulesPath = path.resolve(workspacePath, "node_modules");
  if (!existsSync(nodeModulesPath)) {
    logger.logInfo("Does not look like nodejs project");
    return;
  }
  const nodeModulesList = readdirSync(nodeModulesPath);
  const modulesToTraverse = nodeModulesList.reduce<string[]>((acc, module) => {
    const isNameSpacedDirectory = module.startsWith("@");
    const modulePath = path.resolve(nodeModulesPath, module);
    const stat = statSync(modulePath);
    const isDirectory = stat.isDirectory();
    if (isNameSpacedDirectory && isDirectory) {
      const nameSpacePath = modulePath;
      const nameSpacedNodeModulesList = readdirSync(nameSpacePath);
      const demo = nameSpacedNodeModulesList
        .map((nameSpacedModule) => {
          const namedSpacedModulePath = path.resolve(
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
  modulesToTraverse
    .forEach((module) => {
      try {
        let indexFilePath = path.resolve(module, "index.ts");
        if (indexFilePath && isBarrel(indexFilePath)) {
          const val = indexFilePath.replace(nodeModulesPath + "/", "");
          cache.add(val);
        }
        indexFilePath = path.resolve(module, "index.js");
        if (indexFilePath && isBarrel(indexFilePath)) {
          const val = indexFilePath.replace(nodeModulesPath + "/", "");
          cache.add(val);
        }
        indexFilePath = path.resolve(module, "index.mjs");
        if (indexFilePath && isBarrel(indexFilePath)) {
          const val = indexFilePath.replace(nodeModulesPath + "/", "");
          cache.add(val);
        }
        indexFilePath = path.resolve(module, "index.d.ts");
        if (indexFilePath && isBarrel(indexFilePath)) {
          const val = indexFilePath.replace(nodeModulesPath + "/", "");
          cache.add(val);
        }
        return "";
      } catch {
        return ""
      }
    })
}
