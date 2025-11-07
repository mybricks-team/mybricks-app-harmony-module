$r('app.api.import.appRouter')
$r('app.api.import.utils')
import { onComEvent as baseOnComEvent } from "./common/Index"
$r('app.api.export.pageUrl')

export const open = (name: string, param: MyBricks.Any) => {
  $r('app.api.router.open')
}

export const close = () => {
  $r('app.api.router.close')
}

$r('app.api.export.pagconfigNavigationUrl')

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

$r('app.api.onComEvent.ComEvent')

export const onComEvent = (comEvent: ComEvent): void => {
  return baseOnComEvent(comEvent);
}
