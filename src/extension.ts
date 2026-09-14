import * as vscode from 'vscode';

const COMMAND_ID = 'ScopeReplace.findAndReplace';
const MAX_RESULTS = 5000;

interface FileItem extends vscode.QuickPickItem {
  uri: vscode.Uri;
}

interface ReplacementResult {
  replacements: number;
  files: number;
  failed: number;
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND_ID, findAndReplace)
  );
}

export function deactivate(): void { }

async function findAndReplace(): Promise<void> {
  const searchText = await promptForSearchText();
  if (searchText === undefined || searchText.trim() === '') {
    return;
  }

  const replaceText = await promptForReplaceText(searchText);
  if (replaceText === undefined) {
    return;
  }

  const uris = await pickFiles();
  if (uris === undefined) {
    return;
  }
  if (uris.length === 0) {
    vscode.window.showWarningMessage('No files were selected.');
    return;
  }

  const result = await applyReplacements(uris, searchText, replaceText);

  const noun = (n: number, singular: string, plural: string): string =>
    `${n} ${n === 1 ? singular : plural}`;

  let message = `${noun(result.replacements, 'replacement', 'replacements')} across ${noun(result.files, 'file', 'files')}`;
  if (result.failed > 0) {
    message += `. ${noun(result.failed, 'file', 'files')} could not be updated.`;
  }
  message += '.';

  vscode.window.showInformationMessage(message);
}

async function promptForSearchText(): Promise<string | undefined> {
  return vscode.window.showInputBox({
    title: 'ScopeReplace: Find & Replace',
    prompt: 'Enter the text to search for',
    placeHolder: 'Search',
    validateInput: (value: string): string | undefined =>
      value.trim() === '' ? 'Search text cannot be empty.' : undefined,
  });
}

async function promptForReplaceText(searchText: string): Promise<string | undefined> {
  return vscode.window.showInputBox({
    title: 'ScopeReplace: Find & Replace',
    prompt: `Enter the replacement text for "${searchText}". Leave empty to delete matches.`,
    placeHolder: 'Replace',
  });
}

async function pickFiles(): Promise<vscode.Uri[] | undefined> {
  const files = await vscode.workspace.findFiles('**/*', null, MAX_RESULTS);
  if (files.length === 0) {
    vscode.window.showWarningMessage('No files found in the workspace.');
    return undefined;
  }

  const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '';

  const quickPick = vscode.window.createQuickPick<FileItem>();
  quickPick.title = 'ScopeReplace: Select files to update';
  quickPick.placeholder = 'Type to filter. Space toggles a file. Enter applies to selected.';
  quickPick.canSelectMany = true;
  quickPick.ignoreFocusOut = false;
  quickPick.items = files.map((uri) => ({
    label: vscode.workspace.asRelativePath(uri),
    description: workspacePath && uri.fsPath.startsWith(workspacePath) ? '' : uri.fsPath,
    uri,
  }));

  quickPick.onDidChangeSelection((selected) => {
    quickPick.title = `ScopeReplace: Select files to update (${selected.length} selected)`;
  });

  const result = await new Promise<vscode.Uri[] | undefined>((resolve) => {
    const done = (value: vscode.Uri[] | undefined): void => {
      quickPick.hide();
      resolve(value);
    };

    quickPick.onDidAccept(() => {
      done(quickPick.selectedItems.map((item) => item.uri));
    });
    quickPick.onDidHide(() => {
      resolve(undefined);
    });
    quickPick.show();
  });

  quickPick.dispose();
  return result;
}

async function applyReplacements(
  uris: vscode.Uri[],
  searchText: string,
  replaceText: string
): Promise<ReplacementResult> {
  let replacements = 0;
  let files = 0;
  let failed = 0;

  for (const uri of uris) {
    try {
      const document = await vscode.workspace.openTextDocument(uri);
      const text = document.getText();
      const count = occurrences(text, searchText);
      if (count === 0) {
        continue;
      }
      const updated = text.split(searchText).join(replaceText);
      const fullRange = new vscode.Range(new vscode.Position(0, 0), document.positionAt(text.length));
      const edit = new vscode.WorkspaceEdit();
      edit.replace(uri, fullRange, updated);
      await vscode.workspace.applyEdit(edit);
      const saved = await document.save();
      if (!saved) {
        failed++;
        continue;
      }
      replacements += count;
      files++;
    } catch {
      failed++;
    }
  }

  return { replacements, files, failed };
}

function occurrences(text: string, needle: string): number {
  return text.split(needle).length - 1;
}