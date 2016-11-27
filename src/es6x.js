const {
    any,
    end,
    find,
    next,
    optional,
    repeat,
    required,
    sequence,
    deffered
} = require('nano-parser');

let outputMethod;

const
    whiteSpace = find(/^\s+/),
    optionalWhiteSpace = optional(whiteSpace),
    textNode = find(/^[^<]+/),
    tagName = find(/^[a-zA-Z][a-zA-Z0-9]*/),
    placeholder = next(),
    attrName = find(/^[a-zA-Z_][a-zA-Z0-9]*/),
    booleanAttr = attrName.then(result => [result, true]),
    quotedAttr = sequence(
        attrName,
        find('='),
        any(
            sequence(
                find('\''),
                find(/[^']*/),
                required(find('\''))
            ),
            sequence(
                find('"'),
                find(/[^"]*/),
                required(find('"'))
            )
        )
    ).then(result => [result[0], result[2][1]]),
    attrWithPlaceholder = sequence(
        attrName,
        find('='),
        any(
            placeholder,
            sequence(
                find('\''),
                placeholder,
                required(find('\''))
            ).then(result => result[1]),
            sequence(
                find('"'),
                placeholder,
                required(find('"'))
            ).then(result => result[1])
        )
    ).then(result => (obj, values) => {
        obj[result[0]] = values[result[2]];
    }),
    attrs = repeat(
        any(
            placeholder.then(index => (obj, values) => {
                const value = values[index],
                    keys = Object.keys(value);
                let i = keys.length;

                while (i--) {
                    obj[keys[i]] = value[keys[i]];
                }
            }),
            attrWithPlaceholder,
            quotedAttr,
            booleanAttr
        ),
        whiteSpace
    ).then(results => values => {
        const memo = {};

        for (let i = 0, l = results.length; i < l; i++) {
            const result = results[i];
            if (typeof result === 'function') {
                result(memo, values);
            } else {
                memo[result[0]] = result[1];
            }
        }

        return memo;
    }),
    component = sequence(
        optionalWhiteSpace,
        find('<').not(find('</')),
        required(any(
            tagName,
            placeholder.then(index => values => values[index])
        )),
        optional(sequence(
            whiteSpace,
            attrs
        )).then(result => values => result ? result[1](values) : {}),
        optionalWhiteSpace,
        required(any(
            find('/>').then(() => []),
            sequence(
                required(find('>')),
                optional(repeat(any(
                    deffered(() => component),
                    textNode,
                    placeholder.then(index => values => values[index])
                ))),
                required(sequence(
                    find('</'),
                    any(
                        tagName,
                        placeholder
                    ),
                    optionalWhiteSpace,
                    find('>')
                ))
            ).then(result => values => {
                const memo = [],
                    items = result[1] || [];

                for (let i = 0, l = items.length; i < l; i++) {
                    const item = items[i];
                    memo[i] = typeof item === 'function' ? item(values) : item;
                }

                return memo;
            })
        )),
        optionalWhiteSpace
    ).then(result => values => outputMethod(
        typeof result[2] === 'function' ? result[2](values) : result[2],
        result[3](values),
        typeof result[5] === 'function' ? result[5](values) : result[5]
    )),

    root = sequence(
        component,
        end()
    ).useCache().then((result, values) => result[0](values)),

    defaultOutput = function defaultOutput(tag, attrs, children) {
        return {
            tag,
            attrs,
            children
        };
    },

    es6x = function es6x(templates, ...values) {
        return root.parse(templates, values, true);
    };

es6x.setOutputMethod = function setOutputMethod(method) {
    if (method) {
        outputMethod = method;
    } else {
        outputMethod = defaultOutput;
    }
}

es6x.setOutputMethod();

module.exports = es6x;
