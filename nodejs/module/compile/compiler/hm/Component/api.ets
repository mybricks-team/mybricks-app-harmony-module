import { HMRouterMgr } from "@hadss/hmrouter"
$r('app.api.import.utils')
$r('app.api.import')

export const PAGE_URL = $r('app.config.pageUrl')

export const open = () => {
  HMRouterMgr.push({
    pageUrl: PAGE_URL,
  })
}

export const close = () => {
  HMRouterMgr.pop()
}

export const config = $r('app.api.config')

class Api {
  $r('app.api.apis')
}

export const api = new Api()
