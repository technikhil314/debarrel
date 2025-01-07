import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  createSourceFile,
  isClassDeclaration,
  isExportAssignment,
  isExportDeclaration,
  isFunctionDeclaration,
  isImportDeclaration,
  ScriptTarget,
} from "typescript";
import logger from "./logger";

export default function isBarrel(filePath: string, tempDir: string) {
  if (!existsSync(filePath)) {
    return false;
  }
  const sourceCode = readFileSync(filePath, "utf-8");
  const uuid = crypto.randomUUID();
  const tempFileName = join(tempDir, uuid);
  const sourceFile = createSourceFile(
    tempFileName,
    sourceCode,
    ScriptTarget.Latest,
    true
  );
  let hasOnlyReExports = true;
  // Walk through each statement in the file
  sourceFile.forEachChild((node) => {
    if (isExportDeclaration(node)) {
      // Check if it has a module specifier (e.g., `export * from './module'` or `export { A } from './module'`)
      if (node.moduleSpecifier) {
        return;
      }
    } else if (isImportDeclaration(node)) {
      // Ignore imports since they might be used in barrel files with re-export
      return;
    } else if (
      isExportAssignment(node) ||
      isFunctionDeclaration(node) ||
      isClassDeclaration(node)
    ) {
      // Found actual implementation logic, not just re-exports
      hasOnlyReExports = false;
    }
  });
  logger.logDebug("isBarrel.ts - barrel output", { filePath, hasOnlyReExports })
  return hasOnlyReExports;
}
