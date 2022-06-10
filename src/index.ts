import { getType, Type } from "tst-reflect"

const usingTypes: Map<any, any> = new Map();

/*
 * Saves default value for specified type
 * If this type already saved, it will rewrite with new value
 * @param defaultValue Default value for the type <T>
 */
export function useDefault<T>(defaultValue: T, type?: Type): void {
    const t = type ? type : getType<T>();
    let d = defaultValue as any;
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
export function mergeDefaults<T>(value: T, type?: Type): T {

    const t = type instanceof Type ? type : getType<T>();
 
    let v = value as any;
    if (v === undefined) {
        v = getDefaultValue(t);
    }

    const props = t.getProperties()
    for (const prop of props) {
        if (!prop.optional) {
            if (v[prop.name] === undefined || prop.type.isObjectLike()) {
                v[prop.name] = mergeDefaults(v[prop.name], prop.type);
            }
        }
    }

    return v
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
export function getDefaultValue<T>(t?: Type): any {
    const type = t ? t : getType<T>();

    if (usingTypes.has(type)) {
        return usingTypes.get(type);
    } else if (type.isArray() || type.isTuple()) {
        return [];
    } else if (type.isBoolean()) {
        return false;
    } else if (type.isEnum() || type.isNumber()) {
        return 0;
    } else if (type.isObjectLike()) {
        return {}
    } else if (type.isString()) {
        return "";
    }

    return null;
}