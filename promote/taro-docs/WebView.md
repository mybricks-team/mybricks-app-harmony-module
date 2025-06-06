# WebView - web-view 组件是一个可以用来承载网页的容器，会自动铺满整个小程序页面。个人类型与海外类型的小程序暂不支持使用。

## 类型
```tsx
ComponentType<WebViewProps>
```

## 最佳实践
```render
import { WebView } from '@tarojs/components';

export default () => {
  return (
    <WebView src='https://mp.weixin.qq.com/' onMessage={() => {}} />
  )
}
```

## WebViewProps

| 参数 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | :---: | :---: | --- |
| src | `string` |  | 是 | webview 指向网页的链接。可打开关联的公众号的文章，其它网页需登录小程序管理后台配置业务域名。 |
| onMessage | `EventFunction<onMessageEventDetail>` |  | 否 | 网页向小程序 postMessage 时，会在特定时机（小程序后退、组件销毁、分享）触发并收到消息。e.detail = { data } |
| onLoad | `EventFunction<onLoadEventDetail>` |  | 否 | 网页加载成功时候触发此事件。e.detail = { src } |
| onError | `EventFunction<onErrorEventDetail>` |  | 否 | 网页加载失败的时候触发此事件。e.detail = { src } |

### onMessageEventDetail

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| data | `any[]` | 消息数据，是多次 postMessage 的参数组成的数组 |

### onLoadEventDetail

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| src | `string` | 网页链接 |

### onErrorEventDetail

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| src | `string` | 网页链接 |

### onErrorEventDetail

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| src | `string` | 网页链接 |