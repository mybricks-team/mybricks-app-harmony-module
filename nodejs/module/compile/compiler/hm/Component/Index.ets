import MyBricksIndex from "./pages/Index"
import { PAGE_URL } from "./api"

/** 所有页面入口 Builder */
@Builder
export function PagesBuilder() {
  NavDestination() {
    MyBricksIndex()
  }.hideTitleBar(true)
}