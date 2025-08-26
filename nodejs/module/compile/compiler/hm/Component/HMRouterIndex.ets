import { HMRouter } from "@hadss/hmrouter"
import MyBricksIndex from "./pages/Index"
import { PAGE_URL } from "./api"

@HMRouter({ pageUrl: PAGE_URL })
@ComponentV2
export default struct Module {
  build() {
    MyBricksIndex()
  }
}

export * from "./api"
export * from "./sections/Index"
export { ModuleController } from "@mybricks/render-utils"
