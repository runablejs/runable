import type {
  NavigationFailure,
  NavigationGuard,
  RouteLocationRaw,
  Router,
  useRoute as _useRoute,
  useRouter as _useRouter,
} from "vue-router";
import { useApp } from "../context/composables";
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

export const navigateTo = (
  to: RouteLocationRaw | undefined | null,
  //   options?: NavigateToOptions,
):
  | Promise<void | NavigationFailure | false>
  | false
  | void
  | RouteLocationRaw => {};
