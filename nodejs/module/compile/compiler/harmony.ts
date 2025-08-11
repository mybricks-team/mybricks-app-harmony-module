import toHarmonyCode from "@mybricks/to-code-react/dist/cjs/toHarmonyCode"
import * as path from "path";
import * as fse from "fs-extra";
import { COMPONENT_PACKAGE_NAME, RENDER_UTILS_PACKAGE_NAME } from "./hm/constant";
import { pinyin, cleanAndSplitString, firstCharToUpperCase, downloadZip, AdmZip } from "../utils";
import createUtilsMybricks from "./createUtilsMybricks";

/**
 * [DISCUSS] 组件namespace命名规范，除了中文0-9a-zA-Z，只允许使用 . 和 _ 两个特殊字符
 */

function convertNamespaceToComponentName(namespace: string) {
  return namespace
    .split(".")
    .map((text) => {
      if (text.toUpperCase() === "MYBRICKS") {
        return "MyBricks";
      } else {
        return text[0].toUpperCase() + text.slice(1);
      }
    })
    .join("");
}

const handleEntryCode = (template: string, {
  tabbarScenes,
  normalScenes,
  entryScene,
  tabbarConfig,
  fileNameMap
}) => {
  const allImports = Array.from(new Set([...tabbarScenes, ...normalScenes]))
    .map(scene => `// ${scene.title} \nimport ${fileNameMap[scene.id] || generatePageFileName(scene.title)} from './${fileNameMap[scene.id] || generatePageFileName(scene.title)}';`)
    .join('\n')
  const generateRoutes = (scenes) => scenes
    .map((scene, i) => `${i === 0 ? 'if' : '\t\telse if'} (path === '${scene.id}') {\n\t\t\t${fileNameMap[scene.id] || generatePageFileName(scene.title)}()\n\t\t}`)
    .join('\n');
  const renderMainScenes = generateRoutes(Array.from(new Set([entryScene, ...tabbarScenes, ...normalScenes])))
  const renderScenes = generateRoutes(normalScenes)


  return template
    .replace("$r('app.config.imports')", allImports)
    .replace("$r('app.config.mainScenes')", renderMainScenes)
    .replace("$r('app.config.scenes')", renderScenes)
    .replace("$r('app.config.tabbar')", JSON.stringify(tabbarConfig, null, 2))
    .replace("$r('app.config.entry')", JSON.stringify(entryScene.id))
}

const handlePageCode = (page: ReturnType<typeof toHarmonyCode>[0], {
  params,
  pageConfig: {
    disableScroll = false,
    statusBarStyle,
    navigationBarStyle,
    navigationBarTitleText,
    navigationStyle = 'default',
    showBackIcon = false
  }
}) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { download } = data;

  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? "../utils/types" : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("join")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["join"],
      importType: "named",
    });
  }
  if (page.content.includes("Controller()")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["Controller"],
      importType: "named",
    });
  }
  if (page.content.includes("ModuleController()")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["ModuleController"],
      importType: "named",
    });
  }
  if (page.content.includes("bus.")) {
    page.importManager.addImport({
      packageName: "../api",
      dependencyNames: ["bus"],
      importType: "named",
    });
  }
  if (page.content.includes("events.")) {
    page.importManager.addImport({
      packageName: "../api",
      dependencyNames: ["events"],
      importType: "named",
    });
  }

  switch (navigationStyle) {
    case 'default': {
      page.importManager.addImport({
        packageName: "../utils",
        dependencyNames: ["AppCommonHeader"],
        importType: "named",
      });
      return `${page.importManager.toCode()}

/** ${page.meta.title} */
@ComponentV2
export default struct Page {
  build() {
    NavDestination() {
      AppCommonHeader({
        title: ${JSON.stringify(navigationBarTitleText)},
        titleColor: ${JSON.stringify(navigationBarStyle?.color)},
        barBackgroundColor: ${JSON.stringify(navigationBarStyle?.backgroundColor)},
        showBackIcon: ${Boolean(showBackIcon)}
      })
      Index()
    }
    .hideTitleBar(true)
  }
}

${page.content}
`;
    }
    case 'custom': {
      page.importManager.addImport({
        packageName: "../utils",
        dependencyNames: ["AppCustomHeader"],
        importType: "named",
      });
      return `${page.importManager.toCode()}

/** ${page.meta.title} */
@ComponentV2
export default struct Page {
  build() {
    NavDestination() {
      AppCustomHeader({
        titleColor: ${JSON.stringify(navigationBarStyle?.color)},
        barBackgroundColor: ${JSON.stringify(navigationBarStyle?.backgroundColor)},
      })
      Index()
    }
    .hideTitleBar(true)
  }
}

${page.content}
`;
    }
    case 'none': {
      return `${page.importManager.toCode()}

/** ${page.meta.title} */
@ComponentV2
export default struct Page {
  build() {
    NavDestination() {
      Index()
    }
    .hideTitleBar(true)
  }
}

${page.content}
`;
    }
  }
}

const handlePopupCode = (page: ReturnType<typeof toHarmonyCode>[0], { params }) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { download } = data;
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? "../utils/types" : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("join")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["join"],
      importType: "named",
    });
  }
  if (page.content.includes("Controller()")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["Controller"],
      importType: "named",
    });
  }
  if (page.content.includes("ModuleController()")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["ModuleController"],
      importType: "named",
    });
  }
  if (page.content.includes("bus.")) {
    page.importManager.addImport({
      packageName: "../api",
      dependencyNames: ["bus"],
      importType: "named",
    });
  }
  if (page.content.includes("events.")) {
    page.importManager.addImport({
      packageName: "../api",
      dependencyNames: ["events"],
      importType: "named",
    });
  }
  return `${page.importManager.toCode()}

      /** ${page.meta.title} */
      @ComponentV2
      export default struct Page {
        build() {
          NavDestination() {
            Index()
          }
          .hideTitleBar(true)
          .mode(NavDestinationMode.DIALOG)
          .systemTransition(NavigationSystemTransitionType.NONE)
        }
      }
  
      ${page.content}
      `;
}

const handleModuleCode = (page: ReturnType<typeof toHarmonyCode>[0], { params }) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { download } = data;
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? "../utils/types" : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("join")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["join"],
      importType: "named",
    });
  }
  if (page.content.includes("Controller()")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["Controller"],
      importType: "named",
    });
  }
  if (page.content.includes("ModuleController()")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["ModuleController"],
      importType: "named",
    });
  }
  if (page.content.includes("bus.")) {
    page.importManager.addImport({
      packageName: "../api",
      dependencyNames: ["bus"],
      importType: "named",
    });
  }
  if (page.content.includes("events.")) {
    page.importManager.addImport({
      packageName: "../api",
      dependencyNames: ["events"],
      importType: "named",
    });
  }
  page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["Styles", "MyBricksColumnModifier", "ColumnVisibilityController", "createModuleEventsHandle"],
      importType: "named",
    });
  return `${page.importManager.toCode()}

      ${page.content}
      `;
}

const handleGlobalCode = (page, { params }) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { download } = data;
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? "../utils/types" : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("join")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["join"],
      importType: "named",
    });
  }
  if (page.content.includes("createVariable")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? "../utils/mybricks" : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["createVariable"],
      importType: "named",
    });
  }
  if (page.content.includes("createFx")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? "../utils/mybricks" : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["createFx"],
      importType: "named",
    });
  }
  if (page.content.includes("bus.")) {
    page.importManager.addImport({
      packageName: "../api",
      dependencyNames: ["bus"],
      importType: "named",
    });
  }
  if (page.content.includes("events.")) {
    page.importManager.addImport({
      packageName: "../api",
      dependencyNames: ["events"],
      importType: "named",
    });
  }

  return `${page.importManager.toCode()}
  
  ${page.content}`
}

// const handleReadMeCode = (params) => {
//   const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
//   const { toJson, componentMetaMap, download, basic } = data;
//   const { source } = download;

//   // 当前默认有且只有一个extension
//   const extension = toJson.frames.find((frame) => frame.type === "extension");
//   const { outputs } = extension;

//   const outputsCode = outputs.reduce((pre, cur) => {
//     return pre + (pre ? "\n\n" : "") +
//       `/** 注册${cur.title}回调 */\n` +
//       `api.on<P, R>("${cur.id}", (value) => {\n\n})`
//   }, "")

//   return `# ${basic.name}\n\n` +
//     "模块基于[HMRouter](https://developer.huawei.com/consumer/cn/doc/best-practices/bpta-hmrouter)实现\n\n" +
//     "## 📋 基本信息\n\n" +
//     `- **作者**：${basic.author}\n` +
//     `- **版本**：${basic.version}\n` +
//     `- **更新时间**：${basic.updateTime}\n` +
//     `- **最后更新人**：${basic.updater}\n` +
//     `- **搭建地址**：[点击访问](${basic.link})\n\n` +
//     "## 📦 安装依赖\n\n" +
//     "- [@ohos/axios](https://ohpm.openharmony.cn/#/cn/detail/@ohos%2Faxios)\n" +
//     "- [dayjs](https://ohpm.openharmony.cn/#/cn/detail/dayjs)\n" +
//     (source === "ohpmLibrary" ? (
//       "- [@mybricks/comlib-harmony-normal](https://ohpm.openharmony.cn/#/cn/detail/@mybricks%2Fcomlib-harmony-normal)\n" +
//       "- [@mybricks/render-utils](https://ohpm.openharmony.cn/#/cn/detail/@mybricks%2Frender-utils)\n\n"
//     ) : "\n") +
//     "``` bash\n" +
//     "ohpm i dayjs\n" +
//     "ohpm i @ohos/axios\n" +
//     (source === "ohpmLibrary" ? (
//       "ohpm i @mybricks/comlib-harmony-normal\n" +
//       "ohpm i @mybricks/render-utils\n"
//     ) : "") +
//     "```\n\n" +
//     "## 🚀 使用\n" +
//     "```typescript\n" +
//     'import api from "./api"\n\n' +
//     "/** 打开模块，支持输入参数 */\n" +
//     "api.open(params)" + (outputsCode ? "\n\n" : "") +
//     outputsCode +
//     "\n```"
// }

const handleReadMeCode = (params) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { toJson, componentMetaMap, download, basic } = data;
  const { source } = download;

  let config = null
  let apis = []

  toJson.frames.forEach((frame) => {
    if (frame.type === "extension-config") {
      // 只有一个配置
      config = frame
    } else if (frame.type === "extension-api") {
      // 0或多个api
      apis.push(frame)
    }
  })

  return `# ${basic.name}\n\n` +
    "模块基于[HMRouter](https://developer.huawei.com/consumer/cn/doc/best-practices/bpta-hmrouter)实现\n\n" +
    "## 📋 基本信息\n\n" +
    `- **作者**：${basic.author}\n` +
    `- **版本**：${basic.version}\n` +
    `- **更新时间**：${basic.updateTime}\n` +
    `- **最后更新人**：${basic.updater}\n` +
    `- **搭建地址**：[点击访问](${basic.link})\n\n` +
    "## 📦 安装依赖\n\n" +
    "- [@ohos/axios](https://ohpm.openharmony.cn/#/cn/detail/@ohos%2Faxios)\n" +
    "- [dayjs](https://ohpm.openharmony.cn/#/cn/detail/dayjs)\n" +
    (source === "ohpmLibrary" ? (
      "- [@mybricks/comlib-harmony-normal](https://ohpm.openharmony.cn/#/cn/detail/@mybricks%2Fcomlib-harmony-normal)\n" +
      "- [@mybricks/render-utils](https://ohpm.openharmony.cn/#/cn/detail/@mybricks%2Frender-utils)\n\n"
    ) : "\n") +
    "``` bash\n" +
    "ohpm i dayjs\n" +
    "ohpm i @ohos/axios\n" +
    (source === "ohpmLibrary" ? (
      "ohpm i @mybricks/comlib-harmony-normal\n" +
      "ohpm i @mybricks/render-utils\n"
    ) : "") +
    "```\n\n" +
    "## 🚀 使用\n" +
    "```typescript\n" +
    'import { api, config, onBus } from "./api"\n\n' +
    (config ? (
      `/** 模块配置 */\n` +
      `config(${config.inputs?.length ? "{\n": ""}` + 
      (config.inputs?.length ? config.inputs.reduce((pre, cur) => {
        return pre + `  ${cur.pinId}: value,\n`
      }, "") : "") +
      `${config.inputs?.length ? "}": ""})`
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
    "\n```"
}

export const compilerHarmony = async (params, config) => {
  await compilerHarmonyModule(params, config)
}

const generatePageFileName = (text: string) => {
  const splits = cleanAndSplitString(text);

  return splits.reduce((pre, cur) => {
    return pre + firstCharToUpperCase(pinyin.convertToPinyin(cur, "", true))
  }, "") + "Page"
}

const generatePageCodeWithMetadata = (params) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { toJson, componentMetaMap, download, fileNameMap = {} } = data;
  const verbose = useLog;
  const usedComponentsMap = {};

  const busMap = {
    "mybricks.core-comlib.bus-getUser": {
      name: "getUser"
    }
  }
  const pageCode = toHarmonyCode(toJson, {
    getComponentMetaByNamespace(namespace, config) {
      if (!usedComponentsMap[namespace]) {
        usedComponentsMap[namespace] = config;
      }

      let componentName = convertNamespaceToComponentName(namespace);
      const dependencyNames: string[] = [];

      if (config.type === "js") {
        componentName = componentName[0].toLowerCase() + componentName.slice(1);
      }

      dependencyNames.push(componentName);

      return {
        dependencyImport: {
          packageName: download.source === "sourceCode" ? (config.source === "extensionEvent" ? "./components" : COMPONENT_PACKAGE_NAME) : "@mybricks/comlib-harmony-normal",
          dependencyNames,
          importType: "named",
        },
        componentName: componentName,
      };
    },
    getComponentPackageName(params) {
      if (params?.type === "extensionEvent") {
        return download.source === "sourceCode" ? "./components" : "./components"
      }
      return download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : "../components"
    },
    getUtilsPackageName() {
      return download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : "@mybricks/render-utils"
    },
    getBus(namespace: string) {
      return busMap[namespace]
    },
    getFileName(id) {
      return fileNameMap[id]
    },
    verbose
  });

  let importComponentCode = "";
  let declaredComponentCode = "";

  Object.entries(usedComponentsMap).forEach(([namespace, config]: any) => {
    const namespaceSplit = namespace.split(".")

    const importName = namespaceSplit.join("_");
    const asImportName = (config.type === "ui" ? "Basic" : "basic") + namespaceSplit.map((text) => {
      if (text.toUpperCase() === "MYBRICKS") {
        return "MyBricks";
      }

      return text[0].toUpperCase() + text.slice(1);
    }).join("")

    importComponentCode += `${importName} as ${asImportName},`

    if (config.type === "ui") {
      const importData = importName + "_Data";
      importComponentCode += `${importData},`
      const componentName = asImportName.replace("Basic", "");
      const { hasSlots } = componentMetaMap[namespace]
      declaredComponentCode += `@Builder
      function ${componentName}Builder (params: MyBricksComponentBuilderParams) {
        ${asImportName}({
          uid: params.uid,
          data: new ${importData}(params.data as MyBricks.Any),
          inputs: createInputsHandle(params),
          outputs: createEventsHandle(params),
          styles: createStyles(params),
          ${hasSlots ? "slots: params.slots," : ""}
          ${hasSlots ? "slotsIO: params.slotsIO," : ""}
          parentSlot: params.parentSlot,
          env,
          _env,
        })
      }
      
      @ComponentV2
      export struct ${componentName} {
        @Param @Require uid: string;
        ${verbose ? "@Param @Require title: string;" : ""}
        @Param controller: MyBricks.Controller = Controller();
        @Param @Require data: MyBricks.Data
        @Param events: MyBricks.Events = {}
        @Param styles: Styles = {};
        @Local columnVisibilityController: ColumnVisibilityController = new ColumnVisibilityController()
        ${hasSlots ? "@BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;" : ""}
        ${hasSlots ? "@Local slotsIO: MyBricks.Any = createSlotsIO();" : ""}
        @Param parentSlot?: MyBricks.SlotParams = undefined

        myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

        build() {
          Column() {
            if (this.parentSlot?.itemWrap) {
              this.parentSlot.itemWrap({
                id: this.uid,
                inputs: this.controller._inputEvents
              }).wrap.builder(wrapBuilder(${componentName}Builder), this, this.parentSlot.itemWrap({
                id: this.uid,
                inputs: this.controller._inputEvents
              }).params)
            } else {
              ${componentName}Builder(this)
            }
          }
          .attributeModifier(this.myBricksColumnModifier)
          .visibility(this.columnVisibilityController.visibility)
        }
      }\n`
    } else {
      let componentName = asImportName.replace("basic", "");
      componentName = componentName[0].toLowerCase() + componentName.slice(1);
      declaredComponentCode += `export const ${componentName} = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
        return createJSHandle(${asImportName}, { props, env });
      }\n`
    }
  })

  return {
    pageCode,
    declaredComponentCode,
    importComponentCode
  }
}

const copyComlib = async (params, config) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { download } = data;
  const { targetPath } = config;

  if (download.source !== "ohpmLibrary") {
    // 拷贝comlib
    if (data.comlibs?.[0]?.hmCode) {
      // 配置组件库，使用远程组件库源码
      const comlibZipPath = path.join(targetPath, "comlib.zip");
      await downloadZip({
        url: `${domainName}${data.comlibs?.[0].hmCode}`,
        targetPath: comlibZipPath
      })
      const zip = new AdmZip(comlibZipPath);
      const comlibPath = path.join(targetPath, "comlib");
      zip.extractAllTo(comlibPath, true);
      // 删除下载的zip包
      fse.removeSync(comlibZipPath);
    } else {
      await fse.copy(path.join(__dirname, "./hm/comlib"), path.join(targetPath, "comlib"), { overwrite: true })
    }
  }
}

const copyUtils = async (params, config) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { download } = data;
  const { targetPath } = config;

  if (download.source !== "ohpmLibrary") {
    // 拷贝utils
    await fse.copy(path.join(__dirname, "./hm/utils"), path.join(targetPath, "utils"), { overwrite: true })
    // 写utils/mybricks.js
    // await fse.writeFile(
    //   path.join(targetPath, "utils/mybricks.js"),
    //   createUtilsMybricks({ useLog }),
    //   'utf-8'
    // )
  } else {
    await fse.copy(path.join(__dirname, "./hm/utils/AppRouter.ets"), path.join(targetPath, "utils/AppRouter.ets"), { overwrite: true })
    await fse.copy(path.join(__dirname, "./hm/utils/AppWindow.ets"), path.join(targetPath, "utils/AppWindow.ets"), { overwrite: true })
    await fse.copy(path.join(__dirname, "./hm/utils/index.ets"), path.join(targetPath, "utils/index.ets"), { overwrite: true })
  }
}

const copyComponents = async (params, config) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { download } = data;
  const { targetPath, importComponentCode, declaredComponentCode } = config;

  // 拷贝components
  if (download.source === "ohpmLibrary") {
    await fse.copy(path.join(__dirname, "./hm/components/indexOhpmLibrary.ets"), path.join(targetPath, "components/index.ets"), { overwrite: true })
    await fse.writeFile(
      path.join(targetPath, "components/index.ets"),
      (await fse.readFile(path.join(__dirname, "./hm/components/indexOhpmLibrary.ets"), 'utf-8'))
        .replace(
          "{ domain: undefined }",
          `{ domain: ${data.appConfig?.defaultCallServiceHost ? JSON.stringify(data.appConfig?.defaultCallServiceHost) : undefined}}`,
        )
    );
  } else {
    await fse.copy(path.join(__dirname, "./hm/components/index.ets"), path.join(targetPath, "components/index.ets"), { overwrite: true })
    await fse.writeFile(
      path.join(targetPath, "components/index.ets"),
      (await fse.readFile(path.join(__dirname, "./hm/components/index.ets"), 'utf-8'))
        .replace(
          "{ domain: undefined }",
          `{ domain: ${data.appConfig?.defaultCallServiceHost ? JSON.stringify(data.appConfig?.defaultCallServiceHost) : undefined}}`,
        )
        .replace("$r('app.components.component.import')", importComponentCode ? `import { ${importComponentCode} } from "../comlib/Index"` : "")
        .replace("$r('app.components.component.declared')", declaredComponentCode)
    );
  }
}

const copyJs = async (params, config) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { download } = data;
  const { targetPath, importComponentCode, declaredComponentCode } = config;

  // const jsCodePath = path.join(targetPath, download.source === "ohpmLibrary" ? "components/codes.ts" : "components/codes.js");
  const jsCodePath = path.join(targetPath, "components/codes.ts");
  await fse.ensureFile(jsCodePath)
  await fse.writeFile(jsCodePath, `export default function({ createJSHandle, context }) {
      const comModules = {};
      ${decodeURIComponent(data.allModules?.all)};
      return comModules;
    }`, { encoding: "utf8" })
  // await fse.writeFile(jsCodePath, download.source === "ohpmLibrary" ? `export default function({ createJSHandle, context }) {
  //     const comModules = {};
  //     ${decodeURIComponent(data.allModules?.all)};
  //     return comModules;
  //   }` : `export default (function(comModules) {
  //     ${decodeURIComponent(data.allModules?.all)};
  //     return comModules;
  //   })({})`, { encoding: "utf8" })
}

const getApiCode = async (params, config) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { toJson, download } = data;
  const { targetPath } = config;

  const eventTitles = toJson.frames.filter((frame) => {
    return frame.type === "extension-event"
  }).map((frame) => frame.title);

  const apiCode = await fse.readFile(path.join(targetPath, "api.ets"), "utf-8");
  return apiCode
    .replace("$r('app.config.pageUrl')", `"myBricks${fileId}"`)
    .replace("$r('app.api.import.utils')",
      download.source === "sourceCode" ?
        'import { MyBricks } from "./utils/types";\nimport { transformApi, createBus, transformBus } from "./utils/mybricks"\n;' :
        'import { MyBricks, transformApi, createBus, transformBus } from "@mybricks/render-utils";'
    ) + 
    (
      eventTitles.length ? `
        class Events {
          ${eventTitles.reduce((pre, cur) => {
            return pre + `${cur}: MyBricks.Api = createBus()\n`
          }, "")}}

        export const events = new Events();

        type Event = (value: MyBricks.Any, callBack: Record<string, (value: MyBricks.Any) => void>) => void
        interface OnEventParams {
          ${eventTitles.reduce((pre, cur) => {
            return pre + `${cur}: Event;\n`
          }, "")}}

        export const onEvent: (events: OnEventParams) => void = transformBus(events);
      ` : ""
    );
    // .replace("$r('app.api.import.utils')",
    //   download.source === "sourceCode" ?
    //     'import { MyBricks } from "./utils/types";\nimport { Subject, emit } from "./utils/mybricks"\n;' :
    //     'import { MyBricks, Subject, emit } from "@mybricks/render-utils";'
    // );
}

/** 下载模块 */
const compilerHarmonyModule = async (params, config) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { download, fileNameMap = {} } = data;
  const { Logger } = config;
  const { pageCode, importComponentCode, declaredComponentCode } = generatePageCodeWithMetadata(params);

  // 目标项目路径
  const targetPath = path.join(projectPath, download.fileName || "module");

  // 拷贝项目
  await fse.copy(path.join(__dirname, "./hm/Component"), targetPath, { overwrite: true })
  // 写入README.md [TODO] 放最后处理
  await fse.writeFile(
    path.join(targetPath, "README.md"),
    handleReadMeCode(params),
    { encoding: "utf8" }
  );

  // 拷贝组件库
  await copyComlib(params, {
    targetPath
  })

  // 拷贝utils
  await copyUtils(params, {
    targetPath
  })

  await copyComponents(params, {
    targetPath,
    importComponentCode,
    declaredComponentCode
  })

  let apiCode = await getApiCode(params, {
    targetPath
  })

  const sceneMap = {};
  const moduleNames = new Set<string>();

  let extensionApiCode = "";

  pageCode.forEach((page) => {
    if (page.type === "extension-config") {
      // 配置
      apiCode = apiCode.replace("$r('app.api.import')", page.importManager.toCode()).replace("$r('app.api.config')", `(${page.meta.inputs?.length ? "value: MyBricks.Any" : ""}) => {
  ${page.content}
}`);
      return
    }

    if (page.type === "extension-api") {
      // API
      extensionApiCode = extensionApiCode + page.content
      return
    }

    // if (page.type === "extensionEvent") {
    //   // 业务模块
    //   apiCode = apiCode.replace("$r('app.api.import')", page.importManager.toCode()).replace("$r('app.api.open')", page.content)
    //   return
    // }

    if (page.type === "global") {
      // 全局变量、全局Fx
      fse.outputFileSync(path.join(targetPath, `components/global.ets`), handleGlobalCode(page, { params }), { encoding: "utf8" })
      return
    }

    if (page.type === "module") {
      const fileName = fileNameMap[page.meta.id] || page.name
      moduleNames.add(fileName);
      fse.outputFileSync(path.join(targetPath, `sections/${fileName}.ets`), handleModuleCode(page, { params }), { encoding: "utf8" })
      return
    }

    if (page.meta) {
      sceneMap[page.meta.id] = page.meta;
    }

    let content = "";
    if (page.type === "normal") {
      const { pageConfig } = data.pages.find(p => p.id === page.meta?.id) ?? {}
      // 页面
      content = handlePageCode(page, {
        params, pageConfig
      });
    } else if (page.type === "popup") {
      // 弹窗
      content = handlePopupCode(page, { params });
    }

    const fileName = fileNameMap[page.meta.id] || `${page.name}Page`

    fse.outputFileSync(path.join(targetPath, `pages/${fileName}.ets`), content, { encoding: "utf8" })
  });

  apiCode = apiCode.replace("$r('app.api.apis')", extensionApiCode).replace("$r('app.api.import')", "").replace("$r('app.api.config')", "() => {}");

  if (moduleNames.size) {
    // 有区块，补充区块的入口文件
    fse.outputFileSync(
      path.join(targetPath, `sections/index.ets`),
      Array.from(moduleNames).reduce((pre, cur) => {
        return pre + `export { default as ${cur} } from "./${cur}"\n`
      }, ""),
      { encoding: "utf8" })
  }

  await fse.writeFile(path.join(targetPath, "api.ets"), apiCode)

  // 写入搭建Js
  await copyJs(params, {
    targetPath
  })

  // tabbar配置
  const tabbarConfig = (data.tabBarJson ?? []).map(item => {
    const { pagePath, ...others } = item
    return {
      id: item.pagePath.split('/')[1],
      ...others,
    }
  })

  // 入口场景
  const entryScene = sceneMap[data.entryPageId]

  // tabbar场景
  const tabbarScenes: string[] = data.pages.filter(p =>
    (data.tabBarJson || []).some(
      (b) => b?.id === p?.id
    )
  ).map(p => {
    return sceneMap[p.id]
  })

  // 普通场景
  const normalScenes: string[] = data.pages.filter(p =>
    !(data.tabBarJson || []).some(
      (b) => b?.id === p?.id
    )
  ).map(p => {
    return sceneMap[p.id]
  })

  // 弹窗也写入普通场景判断中
  data.toJson.scenes.forEach((scene) => {
    if (scene.type === "popup") {
      normalScenes.push(sceneMap[scene.id])
    }
  })

  const entryPath = path.join(targetPath, "./pages/Index.ets");
  await fse.copy(path.join(__dirname, "./hm/pages/Index.ets"), entryPath, { overwrite: true });

  let entryFileContent = await fse.readFile(entryPath, 'utf-8')

  entryFileContent = handleEntryCode(entryFileContent, {
    normalScenes,
    tabbarScenes,
    tabbarConfig,
    entryScene,
    fileNameMap
  })
  await fse.writeFile(entryPath, entryFileContent, 'utf-8')
}
