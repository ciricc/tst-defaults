import { getType, Type } from "tst-reflect"

const usingTypes: Map<any, any> = new Map();

/**
 * Saves default value for specified type
 * If this type already saved, it will be rewritten with new value
 * @param defaultValue Default value for the type <T>
 * @param type Type which need to save
 * @reflect
 */
export function useDefault<T>(defaultValue: T, type?: Type): void {
    let t = type ? type : getType<T>();
    t = resolveType(t);

    let d = defaultValue as any;
    
    if (Array.isArray(d)) {
        d = [...d];
    } else if (typeof d == "object") {
        d = Object.assign({}, d);
    }

    usingTypes.set(t, d);
}

/**
 * Deletes default type value from store
 * @param type Type from tst-reflect library
 * @reflect
 */
export function deleteDefault<T>(type?: Type):void {
    let t = type ? type : getType<T>();
    t = resolveType(t);
    usingTypes.delete(t);
}

/**
 * Merges default values into object or array with already reflected type value
 * @param value Current value
 * @param type Type of tst-reflect
 * @returns New rewritten value with default value (or null if not found expected type)
 * @reflect
 */
export function mergeDefaults<T>(value: T, type?: Type): T {
    let t = type ? resolveType(type) : resolveType(getType<T>());
    
    let v = value as any;
    if (v === undefined) {
        v = getDefaultValue(t);
    }

    // Resolving arrays too
    if (t.isArray() && Array.isArray(value) && value.length) {
        
        let typeArg = t.getTypeArguments()[0];
        if (typeArg) {
            for (let i = 0; i < value.length; i++) {
                value[i] = mergeDefaults(value[i], typeArg);
            } 
        }

    } else {

        const props = t.getProperties();
        for (const prop of props) {
            if (!prop.optional) {
                let propType = resolveType(prop.type);
                if (v[prop.name] === undefined || propType.isObjectLike() || propType.isArray()) {
                    v[prop.name] = mergeDefaults(v[prop.name], propType);
                }
            }
        }
    }

    return v
}

/**
 * Check if type if bug-like type of ts-reflect
 * And if it is, gets real type
 * @param type 
 * @returns 
 */
const resolveType = (type: Type):Type => {
    if (type instanceof Function) {
        let t = type() as Type;
        if (!(t instanceof Type)) {
            throw new Error("Type is not a reflected Type")
        }
        return t;
    } else {
        return type;
    }
}

/**
 * Returns default value for specified type <T>
 * Predefined values:
 * number, enum - 0
 * array, tuple - []
 * string - ""
 * boolean - false
 * Object - {}
 * if type not expected - null
 * @param type Typeof tst-reflect library
 * @reflect
 */
export function getDefaultValue<T>(type?: Type): any {
    let t = type ? type : getType<T>();
    t = resolveType(t);
    if (usingTypes.has(t)) {
        
        const defaultValue = usingTypes.get(t);
        
        if (Array.isArray(defaultValue)) {
            return [...defaultValue];
        } else if (Object.prototype.toString.call(defaultValue) == "[object Object]") {
            const newLocal = { ...defaultValue };
            return newLocal;
        }

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