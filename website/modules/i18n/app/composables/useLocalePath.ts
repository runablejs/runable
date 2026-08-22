import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type {
  RouteLocationNormalizedLoaded as RouteLocation,
  RouteLocationRaw as RawLocation,
} from "vue-router";

import type {
  I18nConfig,
  I18nLocale as Locale,
} from "../../types/index.js";

function addLocalePrefix(path: string, locale: Locale): string {
  if (path === "/") return `/${locale}`;
  return `/${locale}/${path.replace(/^\/+/, "")}`;
}

export function useLocalePath(): (
  route: RawLocation | RouteLocation,
  locale?: Locale,
) => string {
  const router = useRouter();
  const { locale: activeLocale } = useI18n();
  const config = (useRuntime().public.i18n as I18nConfig) ?? {};
  const locales = Object.keys(config.messages ?? {}) as Locale[];
  const defaultLocale = config.defaultLocale ?? locales[0];

  const isLocale = (value: unknown): value is Locale => {
    return typeof value === "string" && locales.includes(value as Locale);
  };

  const localizePath = (path: string, locale: Locale): string => {
    const segments = path.split("/").filter(Boolean);
    if (isLocale(segments[0])) segments.shift();

    const basePath = segments.length ? `/${segments.join("/")}` : "/";

    if (config.strategy === "no_prefix") return basePath;
    if (
      config.strategy === "prefix_except_default" &&
      locale === defaultLocale
    ) {
      return basePath;
    }

    return addLocalePrefix(basePath, locale);
  };

  return (route, locale) => {
    const targetLocale = isLocale(locale)
      ? locale
      : isLocale(activeLocale.value)
        ? activeLocale.value
        : defaultLocale;

    const resolved = router.resolve(route as RawLocation);
    const suffix = resolved.fullPath.slice(resolved.path.length);

    return `${localizePath(resolved.path, targetLocale)}${suffix}`;
  };
}

export type { Locale, RawLocation, RouteLocation };
