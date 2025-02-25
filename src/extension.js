const vscode = require('vscode');

let tabGroups = {};

function activate(context) {
    console.log('Tab Groups Extension is now active!');

    let listTabs = vscode.commands.registerCommand('tabgroups.listTabs', () => {
        const tabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
        const tabNames = tabs.map(tab => tab.label);
        vscode.window.showQuickPick(tabNames);
    });
    context.globalState.setKeysForSync(['tabGroups']);
    context.subscriptions.push(listTabs);

    let createGroup = vscode.commands.registerCommand('tabgroups.createGroup', async () => {
        const groupName = await vscode.window.showInputBox({ prompt: 'Enter a name for the new tab group' });
        if (!groupName) return;

        const activeTabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
        const fileUris = activeTabs.map(tab => tab.input instanceof vscode.TabInputText ? tab.input.uri.toString() : '');

        tabGroups[groupName] = fileUris;
        vscode.window.showInformationMessage(`Tab group "${groupName}" saved!`);
    });

    context.subscriptions.push(createGroup);

    let restoreGroup = vscode.commands.registerCommand('tabgroups.restoreGroup', async () => {
        const groupName = await vscode.window.showQuickPick(Object.keys(tabGroups), { placeHolder: 'Select a tab group to restore' });
        if (!groupName) return;

        const fileUris = tabGroups[groupName];
        for (const uri of fileUris) {
            await vscode.window.showTextDocument(vscode.Uri.parse(uri), { preview: false });
        }
    });

    context.subscriptions.push(restoreGroup);
    
    context.globalState.update('tabGroups', tabGroups);
}

function deactivate() {
    console.log('Tab Groups Extension has been deactivated.');
}

module.exports = {
    activate,
    deactivate
};
