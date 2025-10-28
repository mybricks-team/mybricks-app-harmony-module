export const readme = (params, { fileNameMap }) => {
  const { data } = params;
  const { toJson, download, basic } = data;
  const { source, router } = download;
  // const modulePath = download.integrationType === "HSP" ? "模块" : "模块文件夹路径/Index"
  const modulePath = (download.fileName || "module").toLowerCase();

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
    (router === "Navigation" ? `## 🧭 Navigation 初始化
如果需要打开模块内页面，必须调用configNavigation方法进行初始化，传入NavPathStack实例

\`\`\`extendtypescript
import { configNavigation } from "${modulePath}"

// 在入口组件初始化或者其它合适的时机
configNavigation({
  // navPathStack: 当前使用的NavPathStack实例
})
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
      ) : ""})${index === apis.length - 1 ? "" : "\n\n"}`
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
      }, "") + "\n})" :
      "") + 
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

  return "\n\n### 渲染区块\n```extendtypescript" + 
  `\nimport {${importNames} } from "${modulePath}"` + 
  `${createController ? `\n${createController}` : ""}` +
  `${usedSections}` + 
  "\n```"
}

function firstCharToLowerCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
};