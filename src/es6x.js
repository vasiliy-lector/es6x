const {
    any,
    end,
    find,
    next,
    optional,
    repeat,
    required,
    lookForward,
    sequence,
    defer
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
                optionalWhiteSpace,
                optional(any(
                    sequence(
                        repeat(defer(() => component), optionalWhiteSpace),
                        lookForward(find(/^\s*<\//))
                    ).then(result => result[0]).not(find(/^[^<]+/)),
                    repeat(any(
                        placeholder.then(index => values => values[index]),
                        textNode,
                        defer(() => component)
                    ))
                )),
                optionalWhiteSpace,
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
                    items = result[2] || [];

                for (let i = 0, l = items.length; i < l; i++) {
                    const item = items[i];
                    memo[i] = typeof item === 'function' ? item(values) : item;
                }

                return memo;
            })
        ))
    ).then(result => values => outputMethod(
        typeof result[1] === 'function' ? result[1](values) : result[1],
        result[2](values),
        typeof result[4] === 'function' ? result[4](values) : result[4]
    )),

    root = sequence(
        optionalWhiteSpace,
        component,
        optionalWhiteSpace,
        end()
    ).useCache().then((result, values) => result[1](values)),

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

es6x.setOutputMethod = function setOutputMethod(method, childsAsArguments) {
    childsAsArguments = childsAsArguments === undefined ? true : childsAsArguments;

    if (method) {
        outputMethod = function(tag, attrs, children) {
            var args = [tag, attrs];

            for (var i = 0, l = children.length; i < l; i++) {
                args[i + 2] = children[i];
            }

            return method.apply(null, args);
        }
    } else {
        outputMethod = defaultOutput;
    }
}

outputMethod = defaultOutput;

module.exports = es6x;
