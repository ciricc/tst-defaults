import { deleteDefault, getDefaultValue, mergeDefaults, useDefault } from "../../dist/";
import { getType } from "tst-reflect"

type PluginD = {
    name: string
    enabled: boolean
}

enum WorkType {
    UNKNOWN_WORK_TYPE = 0,
    PARALLEL_WORK_TYPE = 1,
    SYNC_WORK_TYPE = 2,
}

type Duration = {
    seconds: number
}

type Settings = {
    settings: {
        use_callback: boolean
        use_snippets: boolean,
        plugins: PluginD[],
        setup_interval: Duration
    },
    setup_users: number
    work_type: WorkType
    users: User[]
}

type Feature = {
    expires: Duration
    points: Array<Number>
}

type User = {
    first_name?: string
    last_name: string
    friends: User[]
    rate_expires?: Duration
    // available_features: Record<string, Feature>
}


const returnIgnoredJsonError = ():any => {}

test("generics works correctly", () => {
    expect(getDefaultValue<number>()).toBe(0)
    expect(mergeDefaults<number>(returnIgnoredJsonError())).toBe(0)
    expect(mergeDefaults<boolean>(returnIgnoredJsonError())).toBe(false)
    useDefault<Duration>({
        seconds: -1
    })
    expect(getDefaultValue<Duration>()).toEqual({
        seconds: -1
    })
})

test('json schema defaults', () => {

    useDefault({
        seconds: -1,
    } as Duration, getType<Duration>());

    const jsonString = `{
        "setup_users": 1024,
        "settings": {
            "use_snippets": true
        },
        "users": [{
            "friends": [{
                "first_name": "Oleg",
                "last_name": "Prokofyev",
                "rate_expires": {
                    "seconds": 1000
                }
            }]
        }]
    }`;

    const config = mergeDefaults(JSON.parse(jsonString), getType<Settings>()) as Settings;
    expect(config).toEqual({
        settings: {
            plugins: [],
            use_callback: false,
            setup_interval: {
                seconds: -1,
            },
            use_snippets: true,
        },
        setup_users: 1024,
        work_type: 0,
        users: [{
            first_name: undefined,
            last_name: "",
            friends: [{
                first_name: "Oleg",
                last_name: "Prokofyev",
                friends: [],
                rate_expires: {
                    seconds: 1000
                },
                // available_features: {
                //     some_feature: {
                //         expires: {seconds: -1},
                //         points: [],
                //     } 
                // },
            }],
            // available_features: {},
        }]
    } as Settings);
})

test("default object and array is not referrence", () => {
    
    const d1 = {
        seconds: -1,
    } as Duration;

    useDefault(d1 as Duration, getType<Duration>());
    
    const d = getDefaultValue(getType<Duration>());
    
    expect(d).not.toBe(d1);
    expect(d).toEqual(d1);
})

test("default values", () => {
    expect(getDefaultValue(getType<Record<string, Feature>>())).toEqual({})
    expect(getDefaultValue(getType<Array<number>>())).toEqual([]);
    expect(getDefaultValue(getType<Object>())).toEqual({});
    expect(getDefaultValue(getType<Function>())).toBe(null);
    expect(getDefaultValue(getType<number>())).toBe(0);
    expect(getDefaultValue(getType<boolean>())).toBe(false);
    expect(getDefaultValue(getType<string>())).toBe("");
    expect(getDefaultValue(getType<String>())).toBe(null);
    expect(getDefaultValue(getType<[boolean, number, Object]>())).toEqual({});
    expect(getDefaultValue(getType<[boolean, number, Object]>())).toEqual({});
})

test("create if undefined value", () => {
    // expect(mergeDefaults({"some_feature": undefined}, getType<Record<string, Feature>>())).toEqual({
    //     "some_feature": {
    //         expires: {seconds: -1},
    //         points: []
    //     } as Feature
    // })
    expect(mergeDefaults(returnIgnoredJsonError(), getType<number>())).toBe(0)
    expect(mergeDefaults(returnIgnoredJsonError(), getType<Object>())).toEqual({})
    expect(mergeDefaults(returnIgnoredJsonError(), getType<Array<number>>())).toEqual([])
    expect(mergeDefaults(returnIgnoredJsonError(), getType<[number, boolean]>())).toEqual({"0": 0, "1": false})
})

test("resolved saved default value is not reference", () => {
    useDefault({
        seconds: -1
    } as Duration, getType<Duration>());
    
    useDefault([0, 0], getType<number[]>());

    const d1 = getDefaultValue(getType<Duration>());
    const d2 = getDefaultValue(getType<Duration>());

    const d3 = getDefaultValue(getType<number[]>());
    const d4 = getDefaultValue(getType<number[]>());

    expect(d1).not.toBe(d2);
    expect(d3).not.toBe(d4);

    deleteDefault(getType<number[]>()) // clear type
})

test("default type stored deleting correctly", () => {
    useDefault({ seconds: -1} as Duration, getType<Duration>()); // object
    expect(getDefaultValue(getType<Duration>())).toEqual({seconds: -1})

    deleteDefault(getType<Duration>())
    expect(getDefaultValue(getType<Duration>())).toEqual({})
})

test("different type arguments defaults", () => {
    useDefault(["a", "b"], getType<string[]>());
    useDefault([1, 2], getType<number[]>())

    const d1 = getDefaultValue(getType<string[]>())
    const d2 = getDefaultValue(getType<number[]>())
    
    expect(d1).not.toEqual(d2);

    expect(d1).toEqual(["a", "b"])
    expect(d2).toEqual([1, 2])

    deleteDefault(getType<string[]>())
    deleteDefault(getType<number[]>())
})