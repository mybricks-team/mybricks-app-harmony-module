import { HMRouterMgr } from "@hadss/hmrouter"
import { MyBricks } from "./utils/types"
import { page } from "./_proxy/Index"
import { Subject, emit } from "./utils/mybricks"

type Callback<P, R> = (value: P) => Promise<R> | ((value: P) => R)

class Api {
  private callbacks: Map<string, Callback<MyBricks.EventValue, MyBricks.EventValue>> = new Map()

  open(params?: MyBricks.EventValue) {
    HMRouterMgr.push({
      pageUrl: PAGE_URL,
    });
    // 出码逻辑打开
    $r('app.api.open')
  }

  on<P, R>(key: string, callback: Callback<P, R>) {
    this.callbacks.set(key, callback)
  }

  emit(key: string, value: MyBricks.EventValue): Subject {
    const callback = this.callbacks.get(key)

    return emit(callback, value)
  }
}

export const PAGE_URL = $r('app.config.pageUrl')

export default new Api()
