export type RunableMode = "development" | "production";

export function getRunableMode(): RunableMode {
  return process.env.RUNABLE_MODE === "production"
    ? "production"
    : "development";
}

export function isRunableProduction(): boolean {
  return getRunableMode() === "production";
}
