import type {
  NavigationFailure,
  NavigationGuard,
  RouteLocationRaw,
  Router,
  useRoute as _useRoute,
  useRouter as _useRouter,
} from "vue-router";
import { useApp } from "@/app/composables/context.js";
import { onScopeDispose } from "vue";

export const useRouter: typeof _useRouter = () => {
  return useApp()?.$router as unknown as Router;
};

export const useRoute: typeof _useRoute = (() => {
  return useApp().$route;
}) as unknown as typeof _useRoute;

export const onBeforeRouteUpdate = (guard: NavigationGuard): void => {
  const unsubscribe = useRouter().beforeEach(guard);
  onScopeDispose(unsubscribe);
};

export interface NavigateToOptions {
  /** Replace the current history entry instead of adding a new one. */
  replace?: boolean;
}

export function navigateTo(
  to: RouteLocationRaw | undefined | null,
  options: NavigateToOptions = {},
): Promise<void | NavigationFailure> | undefined {
  if (to == null) return;

  const router = useRouter();

  if (!router) {
    throw new Error(
      "navigateTo() requires a Vue Router instance installed by Syora.",
    );
  }

  return options.replace ? router.replace(to) : router.push(to);
}
