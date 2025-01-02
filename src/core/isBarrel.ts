import { existsSync, readFileSync } from "fs";
import {
  createSourceFile,
  isClassDeclaration,
  isExportAssignment,
  isExportDeclaration,
  isFunctionDeclaration,
  isImportDeclaration,
  ScriptTarget,
  SyntaxKind,
} from "typescript";
export default function isBarrel(filePath: string) {
  if (!existsSync(filePath)) {
    return false;
  }
  const sourceCode = readFileSync(filePath, "utf-8");
  const sourceFile = createSourceFile(
    filePath,
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
  return hasOnlyReExports;
}
