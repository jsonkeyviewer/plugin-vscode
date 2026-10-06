import * as vscode from 'vscode';
import { resolveJsonKeyPathAt } from '../core/jsonKeyPathResolver';
import { resolveYamlKeyPathAt } from '../core/yamlKeyPathResolver';
import { resolveXmlKeyPathAt  } from '../core/xmlKeyPathResolver';
import { getSettings, isLanguageEnabled } from '../settings/settings';
import { hasBeautifyTooltipAt } from './gutterDecorationProvider';

/**
 * VSCode HoverProvider – equivalent to IntelliJ's ConfigKeyTooltipProvider (Ctrl+Q).
 *
 * Registered for JSON, JSONC, YAML and XML language IDs.
 * Shows the full dot-notation path of the config key under the cursor,
 * optionally followed by the value type.
 */
export class ConfigKeyHoverProvider implements vscode.HoverProvider {

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): vscode.ProviderResult<vscode.Hover> {
        const settings = getSettings();
        if (!settings.tooltipEnabled || !isLanguageEnabled(document.languageId)) { return null; }
        // Dense lines with a beautify marker already supply the formatting tooltip.
        if (hasBeautifyTooltipAt(document, position.line)) { return null; }

        const result = this.resolve(document, position);
        if (!result) { return null; }

        const { path, valueType } = result;

        const md = new vscode.MarkdownString();
        md.supportHtml = false;
        md.isTrusted = false;
        md.appendMarkdown('**complete key name**\n\n');
        md.appendText(path);
        if (settings.showValueType && valueType) {
            md.appendMarkdown(` *(${valueType})*`);
        }

        return new vscode.Hover(md);
    }

    private resolve(
        document: vscode.TextDocument,
        position: vscode.Position,
    ) {
        const text   = document.getText();
        const offset = document.offsetAt(position);
        const lang   = document.languageId;
        if (lang === 'json' || lang === 'jsonc') {
            return resolveJsonKeyPathAt(text, offset);
        }
        if (lang === 'yaml') {
            return resolveYamlKeyPathAt(text, offset);
        }
        if (lang === 'xml') {
            return resolveXmlKeyPathAt(text, offset);
        }
        return null;
    }
}
