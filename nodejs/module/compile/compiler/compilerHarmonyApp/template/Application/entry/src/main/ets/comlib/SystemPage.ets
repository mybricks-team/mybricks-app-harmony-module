import { ApplyRootStyleModifier, ApplyStyleModifier, CSSProperties } from './utils/GetDesignStyle'
import { AnyType } from './types'

export type DataType = AnyType

@ObservedV2
export class Data implements DataType {
  navigationStyle?: string
  navigationBarStyle?: AnyType
  enabledPulldown: boolean = false
  backgroundImage?: string
  backgroundColor?: string

  constructor(config: DataType) {
    this.navigationBarStyle = config?.navigationBarStyle
    this.navigationStyle = config?.navigationStyle
    this.backgroundColor = config?.backgroundColor ?? config.background
    this.backgroundImage = config?.backgroundImage
  }
}

interface Inputs {
}

interface Outputs {
}

@Builder function emptySlot(params: AnyType) {}

@ComponentV2
export default struct MyBricksSystemPage {
  @Param data: Data = new Data({
    background: '#ffffff',
    enabledPulldown: false
  });
  @Param styles: Record<string, CSSProperties> = {}
  @Param inputs?: Inputs = undefined;
  @Param outputs?: Outputs = undefined;
  @Param uid?: string = undefined;
  @Param parentSlot?: AnyType = undefined;

  @Param slotsIO?: AnyType = undefined;
  @BuilderParam slots: (params: AnyType) => void = emptySlot;

  @Local isRefreshing: boolean = false;

  aboutToAppear(): void {

  }

  @Builder
  renderContent () {
    Column() {
      if (this.data.navigationStyle === 'custom') {
        Row() {
          this.slots({
            id: 'header'
          })
        }.backgroundColor(this.data.navigationBarStyle?.backgroundColor)
      }
      Scroll() {
        Column() {
          this.slots({
            id: 'content'
          })
        }
        .width('100%')
        .alignItems(HorizontalAlign.Start)
        .align(Alignment.Start)
      }
      .height('100%')
      .align(Alignment.TopStart)
    }
    .height('100%')
    .width('100%')
  }

  build() {
    if (this.data.enabledPulldown) {
      Refresh({ refreshing: this.isRefreshing }) {
        this.renderContent()
      }
        .backgroundColor(this.data?.backgroundColor)
        .onRefreshing(() => {
          // 数据刷新逻辑
        })
    } else {
      Column() {
        this.renderContent()
      }
        .backgroundColor(this.data?.backgroundColor)
    }
  }
}
