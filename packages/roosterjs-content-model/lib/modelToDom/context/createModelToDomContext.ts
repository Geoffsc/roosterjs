import { EditorContext } from '../../publicTypes/context/EditorContext';
import { getFormatAppliers } from '../../formatHandlers/defaultFormatHandlers';
import { ModelToDomContext } from '../../publicTypes/context/ModelToDomContext';
import { ModelToDomOption } from '../../publicTypes/IExperimentalContentModelEditor';

/**
 * @internal
 * @param editorContext
 * @returns
 */
export function createModelToDomContext(
    editorContext?: EditorContext,
    options?: ModelToDomOption
): ModelToDomContext {
    return {
        ...(editorContext || {
            isDarkMode: false,
            getDarkColor: undefined,
        }),
        regularSelection: {
            current: {
                block: null,
                segment: null,
            },
        },
        formatAppliers: getFormatAppliers(options?.formatApplierOverride),
    };
}
