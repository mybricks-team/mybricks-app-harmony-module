type UnknownJson = Record<string, string | number | boolean | Object> | string | number | boolean

@ObservedV2
export class AppRouter {
  routerStack: Array<string> = new Array();

  public getParams(name: string): UnknownJson | undefined {
    return navigation.getParams(name)
  }

  public push(name: string, params: UnknownJson | undefined = undefined,
    callback: Callback<PopInfo> | undefined = undefined) {
      navigation.navPathStack?.pushPathByName(name, params, callback, true)
  }

  public replace(name: string, params: UnknownJson | undefined = undefined) {
    navigation.navPathStack?.replacePathByName(name, params, true)
  }

  /** 返回上一页 */
  public pop(result?: Object) {
    const length = navigation.navPathStack?.size();

    if (result !== undefined && length !== undefined) {
      if (!isNaN(parseFloat(result as string))) {
        navigation.navPathStack?.popToIndex(length - 1 - parseFloat(result as string), true)
      } else {
        navigation.navPathStack?.pop(result, true)
      }
    } else {
      navigation.navPathStack?.pop(true)
    }
  }

  /** 返回到堆栈中最近的页面 */
  public popToName(name: string) {
    navigation.navPathStack?.popToName(name)
  }

  /**
   * @deprecated
   * */
  public clear() {

  }
}

export const appRouter = new AppRouter()

/** 使用App自定义的路由 */
export interface NavConfig {
  /** App使用中的navPathStack */
  navPathStack: NavPathStack
  /** 配置入口页面的name，需要与RouterMap中的name一致 */
  entryRouter?: string
}

class Navigation {
  navPathStack?: NavPathStack

  registConfig = (config: NavConfig) => {
    this.navPathStack = config.navPathStack
  }
  push = (name: string, param: UnknownJson) => {
    this.navPathStack?.pushPathByName(name, param)
  }
  pop = () => {
    this.navPathStack?.pop()
  }
  getParams = (name: string) => {
    const paramsList = this.navPathStack?.getParamByName(name) as Array<UnknownJson | undefined>
    const params: UnknownJson | undefined = paramsList?.[0]
    return params
  }
}

export const navigation = new Navigation()