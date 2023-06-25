import { NodeType } from 'roosterjs-editor-types';

/**
 * A type map from node type number to its type declaration. This is used by utility function isNodeOfType()
 */
export interface NodeTypeMap {
    /**
     * Attribute node
     */
    [NodeType.Attribute]: Attr;

    /**
     * Comment node
     */
    [NodeType.Comment]: Comment;

    /**
     * DocumentFragment node
     */
    [NodeType.DocumentFragment]: DocumentFragment;

    /**
     * Document node
     */
    [NodeType.Document]: Document;

    /**
     * DocumentType node
     */
    [NodeType.DocumentType]: DocumentType;

    /**
     * HTMLElement node
     */
    [NodeType.Element]: HTMLElement;
    /**
     * ProcessingInstruction node
     */
    [NodeType.ProcessingInstruction]: ProcessingInstruction;

    /**
     * Text node
     */
    [NodeType.Text]: Text;
}

/**
 * Type checker for Node. Return true if it of the specified node type
 * @param node The node to check
 * @param expectedType The type to check
 */
export function isNodeOfType<T extends NodeType>(
    node: Node | null | undefined,
    expectedType: T
): node is NodeTypeMap[T] {
    return !!node && node.nodeType == expectedType;
}

/**
 * Type checker for HTML Element. Return true if the given element is of the specified type.
 * This function only check if the given element is of the expected tag. If the given element is of the sub class
 * of specified tag, it will return false.
 * @param element The element to check
 * @param tagName The expected tag name.
 * @returns True if the given element is of the specified type, otherwise false
 */
export function isElementOfType<T extends keyof HTMLElementTagNameMap>(
    element: Node | null | undefined,
    tagName: T
): element is HTMLElementTagNameMap[T] {
    return isNodeOfType(element, NodeType.Element) && element.tagName == tagName.toUpperCase();
}
