# Label - 用来改进表单组件的可用性。
场景：使用for属性找到对应的id，或将控件放在该标签下，点击时触发对应的控件。for优先级高于内部控件，内部有多个控件的时候默认触发第一个控件。目前可以绑定的控件有：button, checkbox, radio, switch。

## 类型
```tsx
ComponentType<LabelProps>
```

## 最佳实践
``` render
import { RadioGroup, Label, Radio } from '@tarojs/components';

export default () => {
  return (
    <RadioGroup>
      <Label for='1' key='1'>
        <Radio value='USA'>USA</Radio>
      </Label>
      <Label for='2' key='2'>
        <Radio value='CHN' checked>
        CHN
        </Radio>
      </Label>
    </RadioGroup>
  )
}
```

## LabelProps

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | :---: | --- |
| for | `string` | 否 | 绑定控件的 id |