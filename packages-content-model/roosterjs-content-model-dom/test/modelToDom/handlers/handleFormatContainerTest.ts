import { createFormatContainer } from '../../../lib/modelApi/creators/createFormatContainer';
import { createModelToDomContext } from '../../../lib/modelToDom/context/createModelToDomContext';
import { createParagraph } from '../../../lib/modelApi/creators/createParagraph';
import { createText } from '../../../lib/modelApi/creators/createText';
import { handleBlockGroupChildren as originalHandleBlockGroupChildren } from '../../../lib/modelToDom/handlers/handleBlockGroupChildren';
import { handleFormatContainer } from '../../../lib/modelToDom/handlers/handleFormatContainer';
import {
    ContentModelBlockGroup,
    ContentModelBlockHandler,
    ModelToDomContext,
} from 'roosterjs-content-model-types';

describe('handleFormatContainer', () => {
    let context: ModelToDomContext;
    let handleBlockGroupChildren: jasmine.Spy<ContentModelBlockHandler<ContentModelBlockGroup>>;

    beforeEach(() => {
        handleBlockGroupChildren = jasmine.createSpy('handleBlockGroupChildren');
        context = createModelToDomContext(
            {
                allowCacheElement: true,
            },
            {
                modelHandlerOverride: {
                    blockGroupChildren: handleBlockGroupChildren,
                },
            }
        );
    });

    it('Empty quote', () => {
        const parent = document.createElement('div');
        const quote = createFormatContainer('blockquote');

        handleFormatContainer(document, parent, quote, context, null);

        expect(parent.outerHTML).toBe('<div></div>');
        expect(quote.cachedElement).toBeUndefined();
    });

    it('Quote with child', () => {
        const parent = document.createElement('div');
        const quote = createFormatContainer('blockquote');
        const paragraph = createParagraph();
        const text = createText('test');
        quote.blocks.push(paragraph);
        paragraph.segments.push(text);

        handleBlockGroupChildren.and.callFake(originalHandleBlockGroupChildren);

        handleFormatContainer(document, parent, quote, context, null);

        expect(parent.outerHTML).toBe(
            '<div><blockquote style="margin: 0px;"><div>test</div></blockquote></div>'
        );
        expect(handleBlockGroupChildren).toHaveBeenCalledTimes(1);
        expect(handleBlockGroupChildren).toHaveBeenCalledWith(
            document,
            parent.firstChild as HTMLElement,
            quote,
            context,
            null
        );
        expect(quote.cachedElement).toBe(parent.firstChild as HTMLQuoteElement);
    });

    it('Quote with child and refNode', () => {
        const parent = document.createElement('div');
        const br = document.createElement('br');
        const quote = createFormatContainer('blockquote');
        const paragraph = createParagraph();
        const text = createText('test');
        quote.blocks.push(paragraph);
        paragraph.segments.push(text);

        parent.appendChild(br);

        handleBlockGroupChildren.and.callFake(originalHandleBlockGroupChildren);

        const result = handleFormatContainer(document, parent, quote, context, br);

        expect(parent.outerHTML).toBe(
            '<div><blockquote style="margin: 0px;"><div>test</div></blockquote><br></div>'
        );
        expect(handleBlockGroupChildren).toHaveBeenCalledTimes(1);
        expect(handleBlockGroupChildren).toHaveBeenCalledWith(
            document,
            parent.firstChild as HTMLElement,
            quote,
            context,
            null
        );
        expect(quote.cachedElement).toBe(parent.firstChild as HTMLQuoteElement);
        expect(result).toBe(br);
    });

    it('With newNodes', () => {
        const parent = document.createElement('div');
        const quote = createFormatContainer('blockquote');
        const paragraph = createParagraph();
        const text = createText('test');
        quote.blocks.push(paragraph);
        paragraph.segments.push(text);

        handleBlockGroupChildren.and.callFake(originalHandleBlockGroupChildren);

        const newNodes: Node[] = [];

        handleFormatContainer(document, parent, quote, context, null, newNodes);

        expect(parent.innerHTML).toBe(
            '<blockquote style="margin: 0px;"><div>test</div></blockquote>'
        );
        expect(newNodes.length).toBe(1);
        expect(newNodes[0]).toBe(parent.querySelector('blockquote')!);
    });
});
