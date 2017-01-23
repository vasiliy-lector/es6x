const es6x = require('../src/es6x');

describe('es6x', () => {
    it('should convert simple div', () => {
        expect(es6x `<div className="block"></div>`).toEqual({
            tag: 'div',
            attrs: {
                className: 'block'
            },
            children: []
        });
    });

    it('should convert simple div with prop', () => {
        expect(es6x `<div className="block" id=${'id1'}></div>`).toEqual({
            tag: 'div',
            attrs: {
                className: 'block',
                id: 'id1'
            },
            children: []
        });
    });

    it('should support data-attribute', () => {
        expect(es6x `<div className="block" data-id=${1}></div>`).toEqual({
            tag: 'div',
            attrs: {
                className: 'block',
                'data-id': 1
            },
            children: []
        });
    });

    it('should parse component with child', () => {
        const Instance = { instance: true };

        expect(es6x `<instance of=${Instance} text="Text of block"><p>Text from parent</p></instance>`).toEqual({
            tag: 'instance',
            attrs: {
                of: Instance,
                text: 'Text of block'
            },
            children: [{
                tag: 'p',
                attrs: {},
                children: ['Text from parent']
            }]
        });
    });

    it('should correctly work with two same templates but another values', () => {
        expect([
            es6x `<div className="block" id=${'id1'}></div>`,
            es6x `<div className="block" id=${'id2'}></div>`
        ]).toEqual([
            {
                tag: 'div',
                attrs: {
                    className: 'block',
                    id: 'id1'
                },
                children: []
            },
            {
                tag: 'div',
                attrs: {
                    className: 'block',
                    id: 'id2'
                },
                children: []
            }
        ]);
    });

    it('should convert div with props and children', () => {
        expect(es6x `<div className="block" id=${'id1'} ${{ dataset: { rerenderid: '0' } }}><p ${{ dataset: { rerenderid: '1' } }}>${'text'}</p></div>`).toEqual({
            tag: 'div',
            attrs: {
                className: 'block',
                id: 'id1',
                dataset: {
                    rerenderid: '0'
                }
            },
            children: [{
                tag: 'p',
                attrs: {
                    dataset: {
                        rerenderid: '1'
                    }
                },
                children: ['text']
            }]
        });
    });

    it('should convert selfclosed element', () => {
        expect(es6x `<input type="text" checked value="${'3'}" />`).toEqual({
            tag: 'input',
            attrs: {
                type: 'text',
                checked: true,
                value: '3'
            },
            children: []
        });

        expect(es6x `<input type='text' value='${'3'}'/>`).toEqual({
            tag: 'input',
            attrs: {
                type: 'text',
                value: '3'
            },
            children: []
        });
    });

    it('should work with components', () => {
        const Component = {};
        expect(es6x `<${Component}
            id='id1'
            value=${'value1'}
            ${{ name: 'name1' }}
        >Text</${Component}>`).toEqual({
            tag: Component,
            attrs: {
                id: 'id1',
                value: 'value1',
                name: 'name1'
            },
            children: ['Text']
        });
    });

    it('should work with elements with hybrid childs', () => {
        const Component = {};
        expect(es6x `<div className="${'b'}"><p>${'text'}</p>${'something'}</div>`).toEqual({
            tag: 'div',
            attrs: {
                className: 'b'
            },
            children: [{
                tag: 'p',
                attrs: {},
                children: [
                    'text'
                ]
            }, 'something']
        });
    });

    it('should correctly work with white spaces', () => {
        expect(es6x `
            <div>
                <p>
                    Text of paragraph.
                    Value ${'some'} here.
                </p>
                <p>
                    Text <b>text </b> <strong> text</strong> text.
                </p>
            </div>
        `).toEqual({
            tag: 'div',
            attrs: {},
            children: [{
                tag: 'p',
                attrs: {},
                children: [`Text of paragraph.
                    Value `, 'some', ` here.
                `]
            }, {
                tag: 'p',
                attrs: {},
                children: ['Text ', {
                    tag: 'b',
                    attrs: {},
                    children: ['text ']
                }, ' ', {
                    tag: 'strong',
                    attrs: {},
                    children: ['text']
                }, ` text.
                `]
            }]
        });
    });

    it ('should set output method', () => {
        const mockMethod = function(tag, attrs, firstChild) {
            return [tag, attrs, firstChild];
        };

        es6x.setOutputMethod(mockMethod);
        expect(es6x `<p id='id1'>text</p>`).toEqual(['p', { id: 'id1' }, 'text']);
        es6x.setOutputMethod();
    })
});
