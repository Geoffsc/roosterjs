import { ChangeSource, getObjectKeys } from 'roosterjs-content-model-dom';
import { isModelEmptyFast } from './isModelEmptyFast';
import type { WatermarkFormat } from './WatermarkFormat';
import type { EditorPlugin, IEditor, PluginEvent } from 'roosterjs-content-model-types';

const WATERMARK_CONTENT_KEY = '_WatermarkContent';
const styleMap: Record<keyof WatermarkFormat, string> = {
    fontFamily: 'font-family',
    fontSize: 'font-size',
    textColor: 'color',
};

/**
 * A watermark plugin to manage watermark string for roosterjs
 */
export class WatermarkPlugin implements EditorPlugin {
    private editor: IEditor | null = null;
    private format: WatermarkFormat;
    private isShowing = false;
    private darkTextColor: string | null = null;

    /**
     * Create an instance of Watermark plugin
     * @param watermark The watermark string
     */
    constructor(protected watermark: string, format?: WatermarkFormat) {
        this.format = format || {
            fontSize: '14px',
            textColor: '#AAAAAA',
        };
    }

    /**
     * Get a friendly name of  this plugin
     */
    getName() {
        return 'Watermark';
    }

    /**
     * Initialize this plugin. This should only be called from Editor
     * @param editor Editor instance
     */
    initialize(editor: IEditor) {
        this.editor = editor;
    }

    /**
     * Dispose this plugin
     */
    dispose() {
        this.editor = null;
    }

    /**
     * Handle events triggered from editor
     * @param event PluginEvent object
     */
    onPluginEvent(event: PluginEvent) {
        const editor = this.editor;

        if (!editor) {
            return;
        }

        if (
            (event.eventType == 'input' && event.rawEvent.inputType == 'insertText') ||
            event.eventType == 'compositionEnd'
        ) {
            // When input text, editor must not be empty, so we can do hide watermark now without checking content model
            this.showHide(editor, false /*isEmpty*/);
        } else if (
            event.eventType == 'contentChanged' &&
            (event.source == ChangeSource.SwitchToDarkMode ||
                event.source == ChangeSource.SwitchToLightMode) &&
            this.isShowing
        ) {
            // When the placeholder is shown and user switches the mode, we need to update watermark style
            if (
                event.source == ChangeSource.SwitchToDarkMode &&
                !this.darkTextColor &&
                this.format.textColor
            ) {
                // Get the dark color only once when dark mode is enabled for the first time
                this.darkTextColor = editor
                    .getColorManager()
                    .getDarkColor(this.format.textColor, undefined, 'text');
            }

            this.applyWatermarkStyle(editor);
        } else if (
            event.eventType == 'editorReady' ||
            event.eventType == 'contentChanged' ||
            event.eventType == 'input' ||
            event.eventType == 'beforeDispose'
        ) {
            editor.formatContentModel(model => {
                const isEmpty = isModelEmptyFast(model);

                this.showHide(editor, isEmpty);

                return false;
            });
        }
    }

    private showHide(editor: IEditor, isEmpty: boolean) {
        if (this.isShowing && !isEmpty) {
            this.hide(editor);
        } else if (!this.isShowing && isEmpty) {
            this.show(editor);
        }
    }

    protected show(editor: IEditor) {
        this.applyWatermarkStyle(editor);
        this.isShowing = true;
    }

    private applyWatermarkStyle(editor: IEditor) {
        let rule = `position: absolute; pointer-events: none; content: "${this.watermark}";`;
        const format = {
            ...this.format,
            textColor: editor.isDarkMode() ? this.darkTextColor : this.format.textColor,
        };

        getObjectKeys(styleMap).forEach(x => {
            if (format[x]) {
                rule += `${styleMap[x]}: ${format[x]}!important;`;
            }
        });

        editor.setEditorStyle(WATERMARK_CONTENT_KEY, rule, 'before');
    }

    protected hide(editor: IEditor) {
        editor.setEditorStyle(WATERMARK_CONTENT_KEY, null);
        this.isShowing = false;
    }
}
