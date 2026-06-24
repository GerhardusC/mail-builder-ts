// NOTE: There is currently no plan to bring in any features that would use this, but this is available if one day something silly happens and we need platform specific features.
export type RuntimeEnv = "browser" | "node" | "unknown";

export function get_runtime_env(): RuntimeEnv {
    if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
        return 'browser';
    } else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        return 'node';
    }
    return 'unknown';
}
