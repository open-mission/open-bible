export type AppEnv = "development" | "staging" | "production";

export const APP_VERSION: string =
  process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";

export const APP_ENV: AppEnv =
  (process.env.NEXT_PUBLIC_APP_ENV as AppEnv) ?? "development";

/** true em development e staging — false em production */
export const isPreRelease: boolean = APP_ENV !== "production";

export const ENV_LABEL: Record<AppEnv, string> = {
  development: "development",
  staging: "beta",
  production: "",
};
