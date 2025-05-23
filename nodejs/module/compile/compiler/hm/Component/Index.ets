import { HMRouter } from "@hadss/hmrouter"
import MyBricksIndex from "./pages/Index"
import { PAGE_URL } from "./api"

@HMRouter({ pageUrl: PAGE_URL }) // TODO 路由配置
@ComponentV2
export default struct Module {
  build() {
    MyBricksIndex()
  }
}
