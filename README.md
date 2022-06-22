# Make your defaults expectable

This project uses [tst-reflect](https://github.com/Hookyns/tst-reflect) library for making your schemas expectable. For example, if you are parsing JSON with predefined schema but didn't want to check that some fields is not defined in object and want to just get default values.

## Simple example

This simple example shows how much problems we have when parsing JSON in TypeScript.

```ts
type JSONSchema = {
    n: number
    level: {
        n2: number
        bool: boolean
    },
    list: number[],
    b: boolean
}

const parsedJson = JSON.parse('{}') as JSONSchema;

console.log(parsedJson.level.n2 + 1) // error, level is undefined
console.log(parsedJson.list.map(el => el + 1)) // error, list is undefined and has no method map
console.log(parsedJson.n + 1) // NaN

if (parsedJson.b) { // it may have error, because undefined is not a false 
    makeRiskCall()
}

if (paredJson.b === true) { // why we need this in TypeScript?? So much code...
    makeRiskCall()
}

```

But you may say that we have a solution?

```ts
class JSONSchema {
    public n: number = 0;
    public level: {
        n2: number
        bool: boolean
    } = {
        n2: 0,
        bool: false,
    }
    public list: number[] = [];
    public b:boolean = false;
    constructor(v:any) {
        Object.assign(this, v);
    }
}

const parsedJson = new JSONSchema(JSON.parse('{"level": {"n2": 1}}'));

console.log(parsedJson.n + 1) // ok
console.log(parsedJson.level.n2 + 1) // ok, result is 2
console.log(parsedJson.level.bool) // undefined
```

Not so bad, but still not good. And we have much code again.

## Solution

```ts
import { mergeDefaults } from "tst-defaults";

type JSONSchema = {
    n: number
    level: {
        n2: number
        bool: boolean
    },
    list: number[],
    b: boolean
}

const parsedJson = mergeDefaults<JSONSchema>(JSON.parse('{"level":{"bool":true}}'));

console.log(parsedJson.b === false) // ok
console.log(parsedJson.list.map(el => el + 1)) // ok
console.log(parsedJson.level.n2 + 1 === 1) // ok
console.log(parsedJson.level.bool == true) // ok
console.log(parsedJson.n + 1) // ok
```

Simple and fast.

## Installation

```shell
yarn add --dev typescript ttypescript tst-reflect-transformer ts-node
```

```shell
yarn add tst-defaults
```

Setup your `tsconfig.json`

```js
{
    "ts-node": {
      "compiler": "ttypescript"
    },
    "compilerOptions": {
        ...,
        "plugins": [
            {
                "transform": "tst-reflect-transformer"
            }
        ]
    }
}
```

Setup `package.json`

```json
{
    "scripts": {
        "start": "ts-node index.ts",
        "build": "ttsc"
    }
}
```

## API

Some api documentation.

### useDefault

Saves type default value in storage for next time resolving.

```ts
import { useDefault, mergeDefaults } from 'tst-defaults';

type Duration = {
  seconds: number;
};

type Schema = {
  expires: Duration;
  options: Object;
  users: number;
};

useDefault<Duration>({ seconds: -1 });
const config = mergeDefaults<Schema>(JSON.parse('{}'));

console.log(config.expires); // { seconds: -1}
console.log(config.users); // 0
console.log(config.options); // {}
```

### mergeDefaults

Merging default values into variable value. If variable is undefined, than it will create default value for it.

```ts
import { mergeDefaults } from "tst-defaults";

const jsonErrorIgnored = ():any => {}

type Schema = {
    n: number
};

const config = mergeDefaults<Schema>(jsonErrorIgnored());
console.log(config.n) // 0, config is created as object
```

### getDefaultValue

Returns default value for type.

```ts
import { getDefaultValue } from "tst-defaults";

console.log(getDefaultValue<string>()) // ""

enum Person {
    UNKNOWN = 0,
    PRIVATE = 1,
    PUBLIC = 2,
}

console.log(getDefaultValue<string>()) // ""
console.log(getDefaultValue<boolean>()) // false
console.log(getDefaultValue<Object>()) // {}
console.log(getDefaultValue<number>()) // 0
console.log(getDefaultValue<Array<number[]>>()) // []
console.log(getDefaultValue<Function>()) // null
console.log(getDefaultValue<Person>() == Person.UNKNOWN) // true
```

### deleteDefault

Removes type default value from storage.

```ts
import { deleteDefault, useDefault, getDefaultValue } from "tst-defaults";

type Duration = {
  seconds: number;
};

useDefault<Duration>({
    seconds: -1
});

console.log(getDefaultValue<Duration>();) // {seconds: -1}

deleteDefault<Duration>();
console.log(getDefaultValue<Duration>();) // {}

```