import { renderScenes } from "./pages/Index"

/** 所有页面入口 Builder */
@Builder
export function PagesBuilder(name: string) {
  renderScenes(name)
}

export * from "./api"
export * from "./sections/Index"
export { ModuleController } from "@mybricks/render-utils"
