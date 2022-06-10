import { getDefaultValue, mergeDefaults, useDefault } from "../../dist/";
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
}

const returnIgnoredJsonError = ():any => {}

test('json schema defaults', () => {
    useDefault({
        seconds: -1,
    } as Duration, getType<Duration>());

    const jsonString = `{
        "setup_users": 1024,
        "settings": {
            "use_snippets": true
        }
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

test("create if undefined value", () => {
    expect(mergeDefaults(returnIgnoredJsonError(), getType<number>())).toBe(0)
    expect(mergeDefaults(returnIgnoredJsonError(), getType<Object>())).toEqual({})
    expect(mergeDefaults(returnIgnoredJsonError(), getType<Array<number>>())).toEqual([])
    expect(mergeDefaults(returnIgnoredJsonError(), getType<[number, boolean]>())).toEqual({"0": 0, "1": false})
})

test("default values", () => {
    expect(getDefaultValue(getType<Array<number>>())).toEqual([]);
    expect(getDefaultValue(getType<Object>())).toEqual({});
    expect(getDefaultValue(getType<Function>())).toBe(null);
    expect(getDefaultValue(getType<number>())).toBe(0);
    expect(getDefaultValue(getType<boolean>())).toBe(false);
    expect(getDefaultValue(getType<string>())).toBe("");
    expect(getDefaultValue(getType<String>())).toBe(null);
    expect(getDefaultValue(getType<[boolean, number, Object]>())).toEqual({});
})