const vscode = require('vscode');

let tabGroups = {};

function activate(context) {
    console.log('TabSync is now active!');

    tabGroups = context.globalState.get('tabGroups', {});

    let listTabs = vscode.commands.registerCommand('tabsync.listTabs', () => {
        const tabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
        const tabNames = tabs.map(tab => tab.label);
        vscode.window.showQuickPick(tabNames);
    });
    context.subscriptions.push(listTabs);

    let createGroup = vscode.commands.registerCommand('tabsync.createGroup', async () => {
        const groupName = await vscode.window.showInputBox({ prompt: 'Enter a name for the new tab group' });
        if (!groupName) return;

        const activeTabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
        const fileUris = activeTabs.map(tab => tab.input instanceof vscode.TabInputText ? tab.input.uri.toString() : '');

        tabGroups[groupName] = { files: fileUris, color: 'default' };
        await context.globalState.update('tabGroups', tabGroups);

        vscode.window.showInformationMessage(`Tab group "${groupName}" saved!`);
    });

    context.subscriptions.push(createGroup);

    let restoreGroup = vscode.commands.registerCommand('tabsync.restoreGroup', async () => {
        const groupName = await vscode.window.showQuickPick(Object.keys(tabGroups), { placeHolder: 'Select a tab group to restore' });
        if (!groupName) return;

        const fileUris = tabGroups[groupName].files;
        for (const uri of fileUris) {
            await vscode.window.showTextDocument(vscode.Uri.parse(uri), { preview: false });
        }
    });

    context.subscriptions.push(restoreGroup);
    
    let renameGroup = vscode.commands.registerCommand('tabsync.renameGroup', async () => {
        const groupName = await vscode.window.showQuickPick(Object.keys(tabGroups), { placeHolder: 'Select a tab group to rename' });
        if (!groupName) return;
        
        const newName = await vscode.window.showInputBox({ prompt: 'Enter a new name for the tab group', value: groupName });
        if (!newName || newName === groupName) return;
        
        tabGroups[newName] = tabGroups[groupName];
        delete tabGroups[groupName];
        await context.globalState.update('tabGroups', tabGroups);
        
        vscode.window.showInformationMessage(`Tab group renamed to "${newName}".`);
    });
    
    context.subscriptions.push(renameGroup);

    let changeColour = vscode.commands.registerCommand('tabsync.changeColour', async () => {
        const groupName = await vscode.window.showQuickPick(Object.keys(tabGroups), { placeHolder: 'Select a tab group to change color' });
        if (!groupName) return;

        const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Gray', 'Default'];
        const color = await vscode.window.showQuickPick(colors, { placeHolder: 'Select a color' });
        if (!color) return;

        tabGroups[groupName].color = color.toLowerCase();
        await context.globalState.update('tabGroups', tabGroups);
        
        vscode.window.showInformationMessage(`Tab group "${groupName}" color changed to ${color}.`);
    });
    
    context.subscriptions.push(changeColour);
}

function deactivate() {
    console.log('Tab Groups Extension has been deactivated.');
}

module.exports = {
    activate,
    deactivate
};
