// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import coreActivate from "./activate";
import * as cache from "./core/cache";
import logger from "./core/logger";

async function _activate() {
	const oldTsSetting = await vscode.workspace.getConfiguration(
		"typescript.preferences.autoImportFileExcludePatterns"
	);
	const oldJsSetting = await vscode.workspace.getConfiguration(
		"javascript.preferences.autoImportFileExcludePatterns"
	);
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		return;
	}
	const debarrelConfig = vscode.workspace.getConfiguration("debarrel");
	const enableDebugLogs = debarrelConfig.get("enableDebugLogs");
	if (enableDebugLogs) {
		logger.setOutputLevel("DEBUG");
	}
	const isMultiRootWorkspace = workspaceFolders?.length > 1;
	logger.logDebug("is multi root", { isMultiRootWorkspace });
	if (isMultiRootWorkspace) {
		workspaceFolders?.forEach((workspaceFolder) => {
			coreActivate(workspaceFolder);
		});
	} else {
		coreActivate(workspaceFolders[0]);
	}
	const newSetting = cache.get();
	await vscode.workspace
		.getConfiguration()
		.update(
			"typescript.preferences.autoImportFileExcludePatterns",
			oldTsSetting.concat(newSetting),
			vscode.ConfigurationTarget.Workspace
		);
	await vscode.workspace
		.getConfiguration()
		.update(
			"javascript.preferences.autoImportFileExcludePatterns",
			oldJsSetting.concat(newSetting),
			vscode.ConfigurationTarget.Workspace
		);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	logger.logInfo("Debarrel is now being activated");
	_activate();
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand(
		"debarrel.debarrelify",
		() => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			_activate();
			logger.logInfo("Debarrel is now force reactivated");
		}
	);

	context.subscriptions.push(disposable);
	logger.logInfo("Debarrel is now completely active");
}

// This method is called when your extension is deactivated
export function deactivate() { }
