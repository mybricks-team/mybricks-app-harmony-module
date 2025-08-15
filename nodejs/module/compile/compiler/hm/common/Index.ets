import { AttributeUpdater } from '@ohos.arkui.modifier'
import { appRouter } from "../utils/Index"
import jsModulesGenerator from "./JSModules";
import { createJSHandle, createInputsHandle, createEventsHandle, Page, createVariable, createVars, createFx, createSlotsIO, createModuleInputsHandle, createStyles, join, createModuleEventsHandle, createModifier } from "../utils/mybricks"
import { genCallConnector } from "../utils/CallConnector"
import { MyBricks } from "../utils/types"
import { globalVars, globalFxs } from "./global"
$r('app.common.component.import')

type Style = Record<string, string | number>;
export type Styles = Record<string, Style>;
interface MyBricksComponentBuilderParams {
  uid: string
  title?: string
  controller?: MyBricks.Controller
  data: MyBricks.Data
  events?: MyBricks.Events
  styles: Styles
  slots?: (params: MyBricks.SlotParams) => void
  slotsIO?: MyBricks.Any
  parentSlot?: MyBricks.SlotParams
}

class CommonModifier extends AttributeUpdater<CommonAttribute> {

}

interface Context {
  env?: MyBricks.Env
  _env?: MyBricks._Env
}

const context: Context = {}
const _env: MyBricks._Env = {
  currentScenes: {
    close: () => {
      appRouter.pop()
    }
  }
}

const vars: ESObject = createVars(globalVars)
const jsModules: MyBricks.Codes = jsModulesGenerator({ createJSHandle, context });

const env: MyBricks.Any = {
  callConnector: genCallConnector(jsModules, { domain: undefined }, { globalVars: vars }),
  appRouter,
  globalVars: vars
}

context.env = env;
context._env = _env;

export const Controller = () => {
  return createInputsHandle({}, true) as MyBricks.Controller
}

export const ModuleController = () => {
  return createModuleInputsHandle() as MyBricks.ModuleController
}

/** 场景打开、输出 */
export const page = new Page(appRouter);

$r('app.common.component.declared')

export {
  jsModules,
  globalFxs,
  globalVars,
  createVariable,
  createFx,
  join,
  createModuleEventsHandle
}
