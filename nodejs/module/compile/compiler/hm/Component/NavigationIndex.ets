import { MyBricks } from "@mybricks/render-utils"
import MyBricksIndex, { renderScenes } from "./pages/Index"
import { appRouter } from "./utils/AppRouter"

/** 所有页面入口 Builder */
@Builder
export function PagesBuilder(param: MyBricks.Any) {
  if (!appRouter.routerStack.length) {
    renderScenes(param.name)
  } else {
    NavDestination() {
      MyBricksIndex()
    }.hideTitleBar(true)
  }
}

export * from "./api"
export * from "./sections/Index"
export { ModuleController } from "@mybricks/render-utils"
