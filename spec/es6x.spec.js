const es6x = require('../src/es6x');

describe('es6x default output', () => {
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

    it('should convert simple div with prop underscore', () => {
        expect(es6x `<div className="block" _=${{ id: 1 }}></div>`).toEqual({
            tag: 'div',
            attrs: {
                className: 'block',
                _: {
                    id: 1
                }
            },
            children: []
        });
    });

    it('should parse component with child', () => {
        const Instance = { instance: true };

        expect(html `<instance of=${Instance} text="Text of block"><p>Text from parent</p></instance>`).toEqual({
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
});
