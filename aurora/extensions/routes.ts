/**
 * Ecom template vendor routes. Delegates to core vendor dashboard when getVendorRouter provided.
 * Future: move full vendor logic here for true template ownership.
 */
import type { RouteFactory } from "@aurora-studio/template-extensions";
import { Router } from "express";

const createVendorRoutes: RouteFactory = (ctx) => {
  const getVendorRouter = (ctx as { getVendorRouter?: () => ReturnType<RouteFactory> }).getVendorRouter;
  if (getVendorRouter) {
    return getVendorRouter();
  }
  return Router();
};

export default createVendorRoutes;
