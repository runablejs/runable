import type {
  I18nConfig,
  I18nLocale,
  I18nMessageObject,
  LocalePersistenceOptions,
} from "./../../types/index.js";
import { createI18n } from "vue-i18n";
import type {
  RouteRecordRaw,
  Router,
  RouteRecordRedirectOption,
} from "vue-router";
import type { ExportedGlobalComposer } from "vue-i18n";

let config: I18nConfig;
let messages: I18nMessageObject;
let locales: I18nLocale[];
let defaultLocale: I18nLocale;
//  = config.defaultLocale ?? locales[0];
const DEFAULT_STORAGE_KEY = "runable_locale";

function getPersistenceOptions(): LocalePersistenceOptions | undefined {
  if (!config.persistence) return;
  if (typeof config.persistence === "string") {
    return { strategy: config.persistence };
  }
  return config.persistence;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return;

  const encodedName = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(encodedName));

  if (!cookie) return;
  return decodeURIComponent(cookie.slice(encodedName.length));
}

function readPersistedLocale(): I18nLocale | undefined {
  if (typeof window === "undefined") return;

  const options = getPersistenceOptions();
  if (!options) return;

  const key = options.key ?? DEFAULT_STORAGE_KEY;

  try {
    const value =
      options.strategy === "cookie"
        ? readCookie(key)
        : options.strategy === "local"
          ? window.localStorage.getItem(key)
          : window.sessionStorage.getItem(key);

    return isLocale(value) ? value : undefined;
  } catch {
    return;
  }
}

function persistLocale(locale: I18nLocale): void {
  if (typeof window === "undefined") return;

  const options = getPersistenceOptions();
  if (!options) return;

  const key = options.key ?? DEFAULT_STORAGE_KEY;

  try {
    if (options.strategy === "local") {
      window.localStorage.setItem(key, locale);
      return;
    }

    if (options.strategy === "session") {
      window.sessionStorage.setItem(key, locale);
      return;
    }

    const attributes = [
      `${encodeURIComponent(key)}=${encodeURIComponent(locale)}`,
      `Path=${options.path ?? "/"}`,
      `Max-Age=${options.maxAge ?? 60 * 60 * 24 * 365}`,
      `SameSite=${options.sameSite ?? "lax"}`,
    ];

    if (options.secure) attributes.push("Secure");
    document.cookie = attributes.join("; ");
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

function isLocale(value: unknown): value is I18nLocale {
  return typeof value === "string" && locales.includes(value as I18nLocale);
}

function resolveLocale(): I18nLocale {
  if (typeof navigator === "undefined") return defaultLocale;

  const persistedLocale = readPersistedLocale();
  if (persistedLocale) return persistedLocale;

  const browserLocales = navigator.languages.length
    ? navigator.languages
    : [navigator.language];

  for (const browserLocale of browserLocales) {
    const language = browserLocale.toLowerCase().split("-")[0];
    if (isLocale(language)) return language;
  }

  return defaultLocale;
}

function prefixPath(path: string, locale: I18nLocale): string {
  if (path === "/") return `/${locale}`;
  return `/${locale}/${path.replace(/^\/+/, "")}`;
}

function removeLocalePrefix(path: string): string {
  const segments = path.split("/").filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  return segments.length ? `/${segments.join("/")}` : "/";
}

function getLocalizedPath(path: string, locale: I18nLocale): string {
  const basePath = removeLocalePrefix(path);

  if (config.strategy === "no_prefix") return basePath;
  if (config.strategy === "prefix_except_default" && locale === defaultLocale) {
    return basePath;
  }

  return prefixPath(basePath, locale);
}

function prefixAlias(
  alias: string | string[] | undefined,
  locale: I18nLocale,
): string | string[] | undefined {
  if (!alias) return alias;

  const aliases = Array.isArray(alias) ? alias : [alias];
  const localized = aliases.map((path) => prefixPath(path, locale));
  return Array.isArray(alias) ? localized : localized[0];
}

function prefixRedirect(
  redirect: RouteRecordRaw["redirect"],
  locale: I18nLocale,
): RouteRecordRaw["redirect"] {
  if (!redirect || typeof redirect === "function") return redirect;
  if (typeof redirect === "string") return prefixPath(redirect, locale);

  const localized: RouteRecordRedirectOption = { ...redirect };

  if ("name" in localized && localized.name) {
    (localized as { name?: string }).name =
      `${locale}:${String(localized.name)}`;
  }

  if ("path" in localized && localized.path) {
    localized.path = prefixPath(localized.path, locale);
  }

  return localized;
}

function localizeRoute(
  route: RouteRecordRaw,
  locale: I18nLocale,
  root = true,
): RouteRecordRaw {
  const localized = {
    ...route,
    path: root ? prefixPath(route.path, locale) : route.path,
    meta: { ...route.meta, locale },
  } as RouteRecordRaw;
  if (route.name) localized.name = `${locale}:${String(route.name)}`;

  if (root && route.alias) {
    localized.alias = prefixAlias(route.alias, locale);
  }

  if (route.redirect) {
    localized.redirect = prefixRedirect(route.redirect, locale);
  }

  if (route.children) {
    localized.children = route.children.map((child) =>
      localizeRoute(child, locale, false),
    );
  }

  return localized;
}

function installLocalizedRoutes(router: Router): void {
  const generatedRoutes = [...router.options.routes];
  let localizedLocales = locales;

  if (config.strategy === "no_prefix") {
    localizedLocales = [];
  } else if (config.strategy === "prefix_except_default") {
    localizedLocales = locales.filter((locale) => locale !== defaultLocale);
  }

  for (const locale of localizedLocales) {
    for (const route of generatedRoutes) {
      router.addRoute(localizeRoute(route, locale));
    }
  }
}

export default defineVuePlugin({
  enforce: "pre",

  setup(vueApp) {
    config = (useRuntime().public.i18n as I18nConfig) ?? {};

    messages = config.messages ?? ({} as I18nMessageObject);
    locales = Object.keys(messages) as I18nLocale[];
    defaultLocale = config.defaultLocale ?? locales[0];

    const i18n = createI18n({
      legacy: false,
      globalInjection: true,
      locale: resolveLocale(),
      fallbackLocale: defaultLocale,
      messages,
    });

    vueApp.use(i18n);

    const router = vueApp.config.globalProperties.$router as Router | undefined;
    if (!router) return;

    const setLocale = async (locale: I18nLocale) => {
      if (!isLocale(locale)) {
        throw new Error(`[i18n] Unknown locale "${String(locale)}".`);
      }

      i18n.global.locale.value = locale;
      persistLocale(locale);

      const currentRoute = router.currentRoute.value;
      const path = getLocalizedPath(currentRoute.path, locale);
      const fullPath = `${path}${currentRoute.fullPath.slice(currentRoute.path.length)}`;

      if (fullPath !== currentRoute.fullPath) {
        await router.push(fullPath);
      }
    };

    i18n.global.setLocale = setLocale;
    (vueApp.config.globalProperties.$i18n as ExportedGlobalComposer).setLocale =
      setLocale;

    installLocalizedRoutes(router);

    router.beforeEach((to) => {
      const locale = to.meta.locale;

      if (isLocale(locale)) {
        i18n.global.locale.value = locale;
        persistLocale(locale);
        return;
      }

      if (config.strategy === "no_prefix") {
        const currentLocale = isLocale(i18n.global.locale.value)
          ? i18n.global.locale.value
          : defaultLocale;

        i18n.global.locale.value = currentLocale;
        persistLocale(currentLocale);
        return;
      }

      if (config.strategy === "prefix") {
        const preferredLocale = isLocale(i18n.global.locale.value)
          ? i18n.global.locale.value
          : defaultLocale;

        return {
          path: prefixPath(to.path, preferredLocale),
          query: to.query,
          hash: to.hash,
          replace: true,
        };
      }

      i18n.global.locale.value = defaultLocale;
      persistLocale(defaultLocale);
    });

    void router.isReady().then(async () => {
      const currentRoute = router.currentRoute.value;
      const pathLocale = currentRoute.path.split("/")[1];

      // addRoute() enrichit le matcher mais ne recalcule pas la route déjà
      // résolue. Si l'URL localisée a d'abord rencontré la page 404, une
      // navigation identique force Vue Router à utiliser la nouvelle route.
      if (isLocale(pathLocale) && currentRoute.meta.locale !== pathLocale) {
        await router.replace(currentRoute.fullPath);
      }
    });

    return {
      provide: { setLocale },
    };
  },
});
