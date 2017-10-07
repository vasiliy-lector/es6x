# es6x
Implementation of jsx features in pure javascript without the need to transpile.

## Why do you need it?
The specification es2015 introduces a new feature called [tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).
Support of this feature now [close to 100%](https://kangax.github.io/compat-table/es6/#test-template_literals).
This standard allow for javascript expressions to be embedded within literal strings. This conception is very close to philosophy of jsx.
And you can write code for react and other virtual dom frameworks using template literals instead of jsx.
This library is very useful if you are not transpiling code in development environment.
Excluding transpilation can speed up development and simplify debugging without dealing with source maps.
The library is very tiny. Only 2kB minified and gzipped. The library support caching on the first execution.
More information you can find in [introduction article](https://medium.com/@vasiliy_lector/is-there-an-alternative-to-jsx-31a1fae6e08a).

## Install and usage
```bash
npm install --save es6x
```

Create file:
```javascript
// file jsx.js
import jsx from 'es6x';
import React from 'react';
jsx.setOutputMethod(React.createElement);
export default jsx;
```
Inside any other file:
```javascript
// file FormController.js
import { Component } from 'react';
import jsx from '../../jsx';
import Input from '../../input/Input';
import Form from '../../form/Form';

const value = 'some';
const props = {
    id: 'id1',
    style: {
        paddingLeft: 10
    }
};

export default class FormController extends Component {
    handleSubmit = () => {};

    render() {
        return jsx `<${Form} onSubmit=${this.handleSubmit}>
            <${Input}
                checked
                className='input'
                value=${value}
                ${props}
            />
        </${Form}>`;
    }
}
```
The render method body is equal to this jsx code:
```javascript
return <Form onSubmit={this.handleSubmit}>
    <Input
        checked
        className='input'
        value={value}
        {...props}
    />
</Form>;
```

If you use hyperscript or any other virtual dom library:
```javascript
// file jsx.js
import jsx from 'es6x';
import h from 'virtual-dom/h';
jsx.setOutputMethod(h);
export default jsx;
```
