$r('app.api.import.utils')
$r('app.api.import')

import { customNavigation } from './utils/AppRouter'

export const PAGE_URL = $r('app.config.pageUrl')

export const open = () => {
  customNavigation.push()
}

export const close = () => {
  customNavigation.pop()
}

export const config = $r('app.api.config')

class Api {
  $r('app.api.apis')
}

export const api = new Api()

class Bus {
  getUser: MyBricks.Api = createBus()
}

export const bus = new Bus();

interface OnBusParamsGetUserCallBack {
  then: (value: MyBricks.Any) => void;
  catch: (value: MyBricks.Any) => void;
}

interface OnBusParams {
  getUser: (value: MyBricks.Any, callBack: OnBusParamsGetUserCallBack) => void;
}

export const onBus: (bus: OnBusParams) => void = transformBus(bus);
