# Make your defaults expectable

This project uses `tst-reflect` library for making your schemas expectable. For example, if you are parsing JSON with predefined schema but didn't want to check that some fields is not defined in object and want to just check default values.

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
import { getType } from "tst-reflect";
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

const parsedJson = mergeDefaults(JSON.parse('{"level":{"bool":true}}'), getType<JSONSchema>()) as JSONSchema;

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
yarn add tst-reflect tst-defaults
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


## Make it more easy

I didn't found solution for use generics with installed npm package. So, you may use this simple util to make more easy usage.

```ts
import { 
    mergeDefaults as mergeDefaultsReflected,
    useDefault as useDefaultReflected,
    getDefaultValue as getDefaultValueReflected,
} from "tst-defaults";

import { getType } from "tst-reflect";

export function mergeDefaults <T>(v: T): T { return mergeDefaultsReflected(v, getType<T>()); }
export function useDefault <T>(v: T) { return useDefaultReflected(v, getType<T>()); }
export function getDefaultValue <T>() { return getDefaultValueReflected(getType<T>()); }
```

```ts
import { mergeDefaults } from "./tst-defaults";
console.log(mergeDefaults<[number, boolean, Object]>(JSON.parse(`[]`)));
```

## API

Some api documentation

### useDefault

Saves type in storage for next time resolving.

```ts
import { useDefault, mergeDefaults } from 'tst-defaults';
import { getType } from 'tst-reflect';

type Duration = {
  seconds: number;
};

type Schema = {
  expires: Duration;
  options: Object;
  users: number;
};

useDefault({ seconds: -1 } as Duration, getType<Duration>());
const config = mergeDefaults(JSON.parse('{}'), getType<Schema>()) as Schema;

console.log(config.expires); // { seconds: -1}
console.log(config.users); // 0
console.log(config.options); // {}
```

### mergeDefaults

Merging default values into variable value. If variable is undefined, than it will create default value for it.

```ts
import { mergeDefaults } from "tst-defaults";
import { getType } from "tst-reflect";

const jsonErrorIgnored = ():any => {}

type Schema = {
    n: number
};

const config = mergeDefaults(jsonErrorIgnored(), getType<Schema>()) as Schema;
console.log(config.n) // 0, config is created as object
```

### getDefaultValue

Returns default value for type

```ts
import { getDefaultValue } from "tst-defaults";
import { getType } from "tst-reflect";

console.log(getDefaultValue(getType<string>())) // ""

enum Person {
    UNKNOWN = 0,
    PRIVATE = 1,
    PUBLIC = 2,
}

console.log(getDefaultValue(getType<string>())) // ""
console.log(getDefaultValue(getType<boolean>())) // false
console.log(getDefaultValue(getType<Object>())) // {}
console.log(getDefaultValue(getType<number>())) // 0
console.log(getDefaultValue(getType<Array<number[]>>())) // []
console.log(getDefaultValue(getType<Function>())) // null
console.log(getDefaultValue(getType<Person>()) == Person.UNKNOWN) // true
```