$r('app.api.import.appRouter')
$r('app.api.import.utils')
$r('app.api.import')
$r('app.api.export.pageUrl')

export const open = () => {
  $r('app.api.router.open')
}

export const close = () => {
  $r('app.api.router.close')
}

export const config = $r('app.api.config')

$r('app.api.export.pagconfigNavigationUrl')

class Api {
$r('app.api.apis')}

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
