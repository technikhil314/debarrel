# debarrel

Debar/exclude/ignore barrel files automatically in vscode.

# Why?

Importing (be it named imports) from barrel files hampers your bundle size very badly.

## Features

1. Install this VSCode extension and it wont suggest you any barrel files in intellisense.
2. This extension forgiving so it wont black list files its not able to detect as barrels

## How to install?

1. go to [the link](https://marketplace.visualstudio.com/items?itemName=technikhil314.debarrel) or search for `debarrel` in your vscode extensions panel
2. click install

## How to verify?

1. Press `Cmd/Ctrl + shift + P` in vscode
2. Type `Workspace settings`
3. click `Preferences: Open workspace settings (JSON)`
4. Search for `autoImportFileExcludePatterns`
5. Note that all the barrel files are now added to exclude pattern.

## How to force the extension after install new npm package?

1. Press `Cmd/Ctrl + shift + P` in vscode
2. Type `debarrelify`
3. click `Debarrel (force barrel recalculation)`
4. It will recalculate all barrel files from node_modules folder

## Facing issues?

1. Make sure to grab all the logs from "output" panel of vscode. Just select debarrel from the dropdown and paste all the logs in issue you will create in next step.
1. Feel free to raise issue on the repository using [this link](https://github.com/technikhil314/debarrel/issues)

## Contributions

Contributions are always welcome.
Read through [contributing.md](CONTRIBUTING.md) for knowing how to setup the repo.
