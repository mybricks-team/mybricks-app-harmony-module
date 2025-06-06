# Form - 表单。将组件内的用户输入的 switch input checkbox slider radio picker 提交。
> 当点击 form 表单中 form-type 为 submit 的 button 组件时，会将表单组件中的 value 值进行提交，需要在表单组件中加上 name 来作为 key。

## 类型
```tsx
ComponentType<FormProps>
```

## FormProps

| 参数 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | :---: | :---: | --- |
| reportSubmit | `boolean` | `false` | 否 | 是否返回 `formId` 用于发送模板消息。 |
| reportSubmitTimeout | `number` | `0` | 否 | 等待一段时间（毫秒数）以确认 `formId` 是否生效。<br />如果未指定这个参数，`formId` 有很小的概率是无效的（如遇到网络失败的情况）。<br />指定这个参数将可以检测 `formId` 是否有效，<br />以这个参数的时间作为这项检测的超时时间。<br />如果失败，将返回 `requestFormId:fail` 开头的 `formId`。 |
| onSubmit | `EventFunction<onSubmitEventDetail>` |  | 否 | 携带 form 中的数据触发 submit 事件 |
| onReset | `EventFunction` |  | 否 | 表单重置时会触发 reset 事件 |

### onSubmitEventDetail

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | :---: | --- |
| value | `{ [formItemName: string]: any; }` | 否 | 当点击 `<form>` 表单中 `form-type` 为 `submit` 的 `<button>` 组件时，<br />会将表单组件中的 `value` 值进行提交，<br />需要在表单组件中加上 `name` 来作为 `key`。 |
| formId | `string` | 否 | 当 `reportSubmit` 为 `true` 时，返回 `formId` 用于发送模板消息。 |
