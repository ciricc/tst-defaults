import { Type } from "tst-reflect"

const usingTypes:Map<any, any> = new Map();

/**
 * Saves default value for specified type
 * If this type already saved, it will rewrite with new value
 * @param defaultValue Default value for the type <T>
 */
export function useDefault(t: Type, defaultValue:any){
    let d = defaultValue;
    if (Array.isArray(d)) {
        d = [...d];
    } else if (typeof d == "object") {
        d = Object.assign({}, d);
    }
    usingTypes.set(t, d);
}

/**
 * Mergin default values into object or array with already reflected type value
 * @param t Type of tst-reflect
 * @param value Current value
 * @returns New rewritten value with default value (or null if not found expected type)
 */
export function mergeDefaults<T>(t: Type, value:T):T {
    if (value === undefined) {
        value = getDefaultValue(t)
    }

    const props = t.getProperties()
    for (const prop of props) {
        if (!prop.optional) {
            if (value[prop.name] === undefined || prop.type.isObjectLike()) {
                value[prop.name] = mergeDefaults(prop.type, value[prop.name]);
            }
        }
    }

    return value
}


/**
 * Returns default value for specified type <T>
 * Predefined values:
 * number, enum - 0
 * array, tuple - []
 * string - ""
 * boolean - false
 * object - {}
 * if type not expected - null
 */
export function getDefaultValue(t:Type):any {
    
    if (usingTypes.has(t)) {
        return usingTypes.get(t);
    } else if (t.isArray() || t.isTuple()) {
        return [];
    } else if (t.isBoolean()) {
        return false;
    } else if (t.isEnum() || t.isNumber()) {
        return 0;
    } else if (t.isObjectLike()) {
        return {}
    } else if (t.isString()) {
        return "";
    }

    return null;
}