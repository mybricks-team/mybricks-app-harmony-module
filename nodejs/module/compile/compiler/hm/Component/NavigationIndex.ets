import MyBricksIndex from "./pages/Index"

/** 所有页面入口 Builder */
@Builder
export function PagesBuilder() {
  NavDestination() {
    MyBricksIndex()
  }.hideTitleBar(true)
}