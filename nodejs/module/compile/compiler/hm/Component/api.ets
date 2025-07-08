import { HMRouterMgr } from "@hadss/hmrouter"
import { MyBricks } from "./utils/types"
import { Subject, emit } from "./utils/mybricks"
$r('app.api.import')

type Callback<P, R> = (value: P) => R

class Api {
  private callbacks: Map<string, Callback<MyBricks.EventValue, MyBricks.EventValue>> = new Map()

  /** 打开模块 */
  open(value?: MyBricks.EventValue) {
    HMRouterMgr.push({
      pageUrl: PAGE_URL,
    });

    $r('app.api.open')
  }

  /** 注册回调 */
  on<P, R = void>(key: string, callback: Callback<P, R>) {
    this.callbacks.set(key, callback)
  }

  /** 调用回调 */
  emit(key: string, value: MyBricks.EventValue): Subject {
    const callback = this.callbacks.get(key)

    return emit(callback, value)
  }

  /** 清除注册的回调 */
  clear() {
    this.callbacks = new Map()
  }

  /** 关闭模块 */
  close() {
    HMRouterMgr.pop()
  }
}

export const PAGE_URL = $r('app.config.pageUrl')

export default new Api()
