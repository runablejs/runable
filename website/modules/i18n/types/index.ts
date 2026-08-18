import type { Locale } from "vue-i18n";

export const strategies = [
  "no_prefix",
  "prefix_and_default",
  "prefix_except_default",
  "prefix",
] as const;

export type I18nStrategy = (typeof strategies)[number];

export type I18nLocale = Locale;

export interface I18nMessage {
  [key: string]: string | I18nMessage;
}

export type I18nMessageObject = Record<I18nLocale, I18nMessage>;

export interface I18nLocaleDefinition {
  code: I18nLocale;
  name: string;
  file: string;
}

export const localePersistenceStrategies = [
  "cookie",
  "local",
  "session",
] as const;

export type LocalePersistenceStrategy =
  (typeof localePersistenceStrategies)[number];

export interface LocalePersistenceOptions {
  strategy: LocalePersistenceStrategy;
  /** Storage key or cookie name. @default "syora_locale" */
  key?: string;
  /** Cookie lifetime in seconds. Only used by the cookie strategy. */
  maxAge?: number;
  /** Cookie path. @default "/" */
  path?: string;
  /** Send the cookie over HTTPS only. */
  secure?: boolean;
  /** Cookie SameSite policy. @default "lax" */
  sameSite?: "strict" | "lax" | "none";
}

export type I18nConfig = {
  strategy?: I18nStrategy;
  defaultLocale?: I18nLocale;
  /** Locale files loaded from `<project root>/i18n/locales`. */
  locales?: I18nLocaleDefinition[];
  /** Inline messages merged over messages loaded from locale files. */
  messages?: I18nMessageObject;
  /** Persist the selected locale in a cookie, localStorage or sessionStorage. */
  persistence?: false | LocalePersistenceStrategy | LocalePersistenceOptions;
};

declare module "vue-i18n" {
  interface ComposerCustom {
    /** Changes the active locale, persists it and updates the current URL. */
    setLocale(locale: I18nLocale): Promise<void>;
  }
  interface ExportedGlobalComposer {
    /** Changes the active locale, persists it and updates the current URL. */
    setLocale(locale: I18nLocale): Promise<void>;
  }
}
