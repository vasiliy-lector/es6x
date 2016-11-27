# es6x
Implementation of jsx features in pure javascript

## Install
```bash
npm install --save es6x
```

## Usage
```javascript
import es6x from 'es6x';

// No need configure for universal using
// For using with react
import React from 'react';
es6x.setOutputMethod(React.createElement);

// For using with hyperscript
import h from 'virtual-dom/h';
es6x.setOutputMethod(h);
```

```javascript
import Input from '../../input/Input';
import Form from '../../form/Form';
const value = 'some',
    props = {
        id: 'id1',
        style: {
            paddingLeft: 10
        }
    };
```

This jsx code:
```javascript
<Form action={handleSubmit}>
    <Input
        className='input'
        value={value}
        {...props}
    />
</Form>;
```
equal to this es6x code:
```javascript
es6x `<${Form} action=${handleSubmit}>
    <${Input}
        className='input'
        value=${value}
        ${props}
    />
</${Form}>`;
```
