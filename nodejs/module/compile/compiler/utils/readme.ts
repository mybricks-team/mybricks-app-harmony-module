export const readme = (params, { fileNameMap }) => {
  const { data } = params;
  const { toJson, download, basic } = data;
  const { source, router } = download;
  const modulePath = download.integrationType === "HSP" ? "模块" : "模块文件夹路径/Index"

  let config = null
  const apis = []
  const events = []
  const sections = []

  toJson.frames.forEach((frame) => {
    if (frame.type === "extension-config") {
      // 只有一个配置
      config = frame
    } else if (frame.type === "extension-api") {
      // 0或多个api
      apis.push(frame)
    } else if (frame.type === "extension-event") {
      events.push(frame);
    }
  })

  toJson.scenes.forEach((scene) => {
    if (scene.type === "module") {
      sections.push(scene)
    }
  })

  return `# ${basic.name}\n\n` +
    (router === "Navigation" ? "模块基于[Navigation](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/arkts-navigation-navigation)实现\n\n" : "模块基于[HMRouter](https://developer.huawei.com/consumer/cn/doc/best-practices/bpta-hmrouter)实现\n\n") +
    "## 📋 基本信息\n\n" +
    `- **作者**：${basic.author}\n` +
    `- **版本**：${basic.version}\n` +
    `- **更新时间**：${basic.updateTime}\n` +
    `- **最后更新人**：${basic.updater}\n` +
    `- **搭建地址**：[点击访问](${basic.link})\n\n` +
    "## 📦 安装依赖\n\n" +
    // "- [@ohos/axios](https://ohpm.openharmony.cn/#/cn/detail/@ohos%2Faxios)\n" +
    // "- [dayjs](https://ohpm.openharmony.cn/#/cn/detail/dayjs)\n" +
    (source === "ohpmLibrary" ? (
      "- [@mybricks/comlib-harmony-normal](https://ohpm.openharmony.cn/#/cn/detail/@mybricks%2Fcomlib-harmony-normal)\n" +
      "- [@mybricks/render-utils](https://ohpm.openharmony.cn/#/cn/detail/@mybricks%2Frender-utils)\n\n"
    ) : (
      "- [dayjs](https://ohpm.openharmony.cn/#/cn/detail/dayjs)\n" +
      "- [@ohos/axios](https://ohpm.openharmony.cn/#/cn/detail/@ohos%2Faxios)\n" +
      "- [@aliyun/oss](https://ohpm.openharmony.cn/#/cn/detail/@aliyun%2Foss)\n" +
      "- [@mybricks/render-utils](https://ohpm.openharmony.cn/#/cn/detail/@mybricks%2Frender-utils)\n\n"
    )) +
    "``` bash\n" +
    // "ohpm i dayjs\n" +
    // "ohpm i @ohos/axios\n" +
    (source === "ohpmLibrary" ? (
      "ohpm i @mybricks/comlib-harmony-normal\n" +
      "ohpm i @mybricks/render-utils\n"
    ) : (
      "ohpm i dayjs\n" +
      "ohpm i @ohos/axios\n" +
      "ohpm i @aliyun/oss\n" +
      "ohpm i @mybricks/render-utils\n"
    )) +
    "```\n\n" +
    (router === "Navigation" ? `## 🧭 Navigation 初始化
由于模块中可能包含一些页面，在使用时需要关注两个方面：

1. 将navPathStack注入给模块，用于跳转页面；
\`\`\`extendtypescript
import { configNavigation } from "${modulePath}"

// 在入口组件初始化或者其它合适的时机
configNavigation({
  // navPathStack: 当前使用的navPathStack实例
  // entryRouter: 定义路由名称，跳转时使用此名称
})
\`\`\`
2. 将模块内的页面注册到Navigation，根据使用方式不同分为，*navDestination* 和 *routerMap.json*

### 使用 navDestination
在navDestination方法中渲染PagesBuilder

\`\`\`extendtypescript
import { PagesBuilder } from "${modulePath}";

@Component
struct Index {

  @Builder
  pageRender(name: string) {
    if (name === 'configNavigation定义的entryRouter') {
      PagesBuilder()
    }
  }
  
  build() {
    Navigation() {
    
    }.navDestination(this.pagesRender)
  }
}
\`\`\`

### 使用 routerMap.json
将PagesBuilder注册到routerMap.json文件中
\`\`\`json
{
  "routerMap": [
    {
      "name": "configNavigation定义的entryRouter",
      "pageSourceFile": "src/main/ets/Index.ets",
      "buildFunction": "PagesBuilder"
    }
  ]
}
\`\`\`

` : '') +
    "## 🚀 使用\n" +
    "```typescript\n" +
    `import { api, config, onBus${events.length ? ", onEvent" : ""} } from "${modulePath}"\n\n` +
    (config ? (
      `/** 模块配置 */\n` +
      `config(${config.inputs?.length ? "{\n" : ""}` +
      (config.inputs?.length ? config.inputs.reduce((pre, cur) => {
        return pre + `  ${cur.pinId}: value,\n`
      }, "") : "") +
      `${config.inputs?.length ? "}" : ""})`
    ) : "") +
    `${apis.length ? "\n\n/** 调用api */\n" + apis.reduce((pre, cur, index) => {
      return pre + `api.${cur.title}(value${cur.outputs?.length ? (
        ", {\n" +
        (cur.outputs.reduce((pre, cur) => {
          return pre + `  ${cur.id}(value) {\n    // ${cur.title}\n  },\n`
        }, "")) +
        "}"
      ) : ", {}"})${index === apis.length - 1 ? "" : "\n\n"}`
    }, "") : ""}` +
    "\n\n/** 注册系统总线 */\n" +
    "onBus({\n" +
    "  /** 总线:获取登录用户 */\n" +
    "  getUser(value, callBack) {\n" +
    "    // callBack.then(value) // 成功时，返回用户信息\n" +
    "    // callBack.catch(value) // 发生错误时，返回错误信息\n" +
    "  }\n" +
    "})" +
    (events.length ? 
      "\n\n/** 注册事件 */" + 
      "\nonEvent({" + 
      events.reduce((pre, cur) => {
        return pre + `\n  ${cur.title}(value${cur.outputs.length ? ", callBack" : ""}) {` + 
        (cur.outputs.length ? cur.outputs.reduce((pre, cur) => {
          return pre + `\n    // callBack.${cur.id}() // ${cur.title}`
        }, "") + "\n  }," : "\n\n  },")
      }, "") :
      "") + 
      "\n})" + 
    "\n```" + (sections.length ? sectionsCode({ sections, fileNameMap, modulePath }) : "")
}

const sectionsCode = (params) => {
  const { sections, fileNameMap, modulePath } = params;
  if (!sections.length) {
    return ""
  }

  let importNames = "";
  let usedSections = "";
  let createController = "";
  sections.forEach((section) => {
    const name = fileNameMap[section.id];
    // const hasInputs = section.inputs.length > 0
    let hasInputs = false;
    let hasConfig = "";
    const hasOutputs = section.outputs.length > 0
    section.inputs.forEach((input) => {
      if (input.type === "normal") {
        hasInputs = true
      } else if (input.type === "config") {
        console.log(input, 123)
        // hasConfig = true
        hasConfig += `\n    ${input.id}: "",\n`
      }
    })

    if (hasInputs) {
      createController += `\n${firstCharToLowerCase(name)}Controller = ModuleController()`
    }
    importNames += ` ${name},`
    if (!hasInputs && !hasOutputs && !hasConfig) {
      usedSections += `\n\n${name}()`
    } else {
      usedSections += `\n\n${name}({` +
        (section.inputs.length ? `\n  controller: this.${firstCharToLowerCase(name)}Controller,` : "") + 
        (section.outputs.length ? (`\n  events: {` + 
          section.outputs.reduce((pre, output) => {
            return pre + `\n    ${output.id}() {\n\n    },`
          }, "") + `\n  }`
        ) : "") + 
        (hasConfig ? (`\n  data: {` + hasConfig + "  }") : "") + 
        "\n})"
    }
  })

  if (createController) {
    importNames += ` ModuleController,`
  }

  return "\n\n```extendtypescript" + 
  `\nimport {${importNames} } from "${modulePath}"` + 
  `${createController ? `\n${createController}` : ""}` +
  `${usedSections}` + 
  "\n```"
}

function firstCharToLowerCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
};