import { configNavigation } from "hsp-package-name";

@Entry
@Component
struct Index {
  private pathStack: NavPathStack = new NavPathStack();

  aboutToAppear(): void {
    configNavigation({
      navPathStack: this.pathStack,
    });
  }

  build() {
    Navigation(this.pathStack) {
      Column() {
        Text('欢迎使用MyBricks鸿蒙模块')
          .fontSize(25)
          .fontWeight(FontWeight.Bold)
        Text('请阅读README.md文件了解如何使用')
          .fontSize(18)
          .fontColor('#1f2328')
          .fontWeight(FontWeight.Medium)
          .margin({ top: 20 })
      }
      .width('100%')
      .height('100%')
      .justifyContent(FlexAlign.Center)
    }
    .hideTitleBar(true)
  }
}