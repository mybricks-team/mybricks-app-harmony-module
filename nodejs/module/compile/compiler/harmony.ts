import toHarmonyCode, { toHarmonyCodeWithAI } from "@mybricks/to-code-react/dist/cjs/toHarmonyCode"
import * as path from "path";
import * as fse from "fs-extra";
import { COMPONENT_PACKAGE_NAME, RENDER_UTILS_PACKAGE_NAME } from "./hm/constant";
import { pinyin, cleanAndSplitString, firstCharToUpperCase, downloadZip, AdmZip } from "../utils";
import fetchAI from "./utils/ai/fetchAI";
import { Logger } from "@mybricks/rocker-commons";

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
    navigationBarStyle,
    navigationBarTitleText,
    navigationStyle = 'default',
    showBackIcon = false
  }
}) => {
  const { data } = params;
  const { download } = data;

  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? "../utils/types" : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("join")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["join"],
      importType: "named",
    });
  }
  if (page.content.includes("Controller()")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["Controller"],
      importType: "named",
    });
  }
  if (page.content.includes("ModuleController()")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
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

  switch (navigationStyle) {
    case 'default': {
      page.importManager.addImport({
        packageName: "../utils/Index",
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
        packageName: "../utils/Index",
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
  const { data } = params;
  const { download } = data;
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? "../utils/types" : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("join")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["join"],
      importType: "named",
    });
  }
  if (page.content.includes("Controller()")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["Controller"],
      importType: "named",
    });
  }
  if (page.content.includes("ModuleController()")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
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
  const { data } = params;
  const { download } = data;
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? "../utils/types" : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("join")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["join"],
      importType: "named",
    });
  }
  if (page.content.includes("Controller()")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["Controller"],
      importType: "named",
    });
  }
  if (page.content.includes("ModuleController()")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
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
  if (page.content.includes("createModuleEventsHandle")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["createModuleEventsHandle"],
      importType: "named",
    });
  }

  if (download.router === "Navigation") {
    page.importManager.addImport({
      packageName: "../utils/AppRouter",
      dependencyNames: ["NavConfig", "navigation"],
      importType: "named",
    });
    page.content = page.content.replace("myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)", `@Param navigation?: NavConfig = undefined
      myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)`)
    if (page.content.includes("@MyBricksDescriptor({")) {
      page.content = page.content.replace("@MyBricksDescriptor({", `@MyBricksDescriptor({
        navigation,`)
    }
  }

  page.importManager.addImport({
    // packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
    packageName: RENDER_UTILS_PACKAGE_NAME,
    dependencyNames: ["Styles", "MyBricksColumnModifier", "ColumnVisibilityController"],
    importType: "named",
  });
  return `${page.importManager.toCode()}

      ${page.content}
      `;
}

const handleGlobalCode = (page, { params }) => {
  const { data } = params;
  const { download } = data;
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? "../utils/types" : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("join")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["join"],
      importType: "named",
    });
  }
  if (page.content.includes("createVariable")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? "../utils/mybricks" : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["createVariable"],
      importType: "named",
    });
  }
  if (page.content.includes("createFx")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? "../utils/mybricks" : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
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

  return `${page.importManager.toCode()}
  
  ${page.content}`
}

const handleReadMeCode = (params) => {
  const { data } = params;
  const { toJson, download, basic } = data;
  const { source, router } = download;

  let config = null
  const apis = []
  const events = []


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
      "ohpm i @mybricks/render-utils\n"
    )) +
    "```\n\n" +
    "## 🚀 使用\n" +
    "```typescript\n" +
    'import { api, config, onBus } from "模块文件夹路径/api"\n\n' +
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
    "\n```"
}

export const compilerHarmony = async (params, config) => {
  Logger.info("[AppHarmonyModule - compiler] - 开始")
  await compilerHarmonyModule(params, config)
}

const generatePageFileName = (text: string) => {
  const splits = cleanAndSplitString(text);

  return splits.reduce((pre, cur) => {
    return pre + firstCharToUpperCase(pinyin.convertToPinyin(cur, "", true))
  }, "") + "Page"
}

const generatePageCodeWithMetadata = async (params) => {
  const { data, useLog = true } = params;
  const { toJson, componentMetaMap, download } = data;
  const verbose = useLog;
  const usedComponentsMap = {};

  const busMap = {
    "mybricks.core-comlib.bus-getUser": {
      name: "getUser"
    }
  }
  Logger.info(`[AppHarmonyModule - compiler] - ${download.enableAI ? "toHarmonyCodeWithAI" : "toHarmonyCode"}`)
  const pageCode = await (download.enableAI ? toHarmonyCodeWithAI : toHarmonyCode)(toJson, {
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
          packageName: download.source === "sourceCode" ? (config.source === "extensionEvent" ? "./common/Index" : COMPONENT_PACKAGE_NAME) : "@mybricks/comlib-harmony-normal",
          dependencyNames,
          importType: "named",
        },
        componentName: componentName,
      };
    },
    getComponentPackageName(params) {
      if (params?.type === "extensionEvent") {
        return "./common/Index"
        // return download.source === "sourceCode" ? "./common/Index" : "./common/Index"
      }
      return download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : "../common/Index"
    },
    getUtilsPackageName() {
      // return download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : "@mybricks/render-utils"
      return RENDER_UTILS_PACKAGE_NAME
    },
    getBus(namespace: string) {
      return busMap[namespace]
    },
    verbose,
    getModuleApi(type) {
      if (type === "event") {
        const componentName = "events";
        return {
          dependencyImport: {
            packageName: "../api",
            dependencyNames: [componentName],
            importType: "named",
          },
          componentName,
        };
      }
    },
    ai: {
      transform: async (messages) => {
        return await fetchAI({
          data: {
            messages,
            model: "openai/gpt-4.1-mini",
          },
          url: "https://ai.mybricks.world/stream-test"
        })
      }
    }
  });

  Logger.info(`[AppHarmonyModule - compiler] - ${download.enableAI ? "toHarmonyCodeWithAI" : "toHarmonyCode"} Done`)

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
      export function ${componentName} (params: MyBricksComponentBuilderParams) {
        ${asImportName}({
          uid: params.uid,
          data: createData(params, ${importData}),
          inputs: createInputsHandle(params),
          outputs: createEventsHandle(params),
          styles: createStyles(params),
          ${hasSlots ? "slots: params.slots," : ""}
          ${hasSlots ? "slotsIO: params.slotsIO," : ""}
          parentSlot: params.parentSlot,
          env,
          _env,
          modifier: createModifier(params, CommonModifier)
        })
      }
      \n`
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
  const { data, domainName } = params;
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

  if (download.source !== "ohpmLibrary" && false) {
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
    await fse.copy(path.join(__dirname, "./hm/utils/Index.ets"), path.join(targetPath, "utils/Index.ets"), { overwrite: true })
  }
}

const copyComponents = async (params, config) => {
  const { data } = params;
  const { download } = data;
  const { targetPath, importComponentCode, declaredComponentCode } = config;

  // 拷贝common
  if (download.source === "ohpmLibrary") {
    await fse.copy(path.join(__dirname, "./hm/common/IndexOhpmLibrary.ets"), path.join(targetPath, "common/Index.ets"), { overwrite: true })
    await fse.writeFile(
      path.join(targetPath, "common/Index.ets"),
      (await fse.readFile(path.join(__dirname, "./hm/common/IndexOhpmLibrary.ets"), 'utf-8'))
        .replace(
          "{ domain: undefined }",
          `{ domain: ${data.appConfig?.defaultCallServiceHost ? JSON.stringify(data.appConfig?.defaultCallServiceHost) : undefined}}`,
        )
    );
  } else {
    await fse.copy(path.join(__dirname, "./hm/common/Index.ets"), path.join(targetPath, "common/Index.ets"), { overwrite: true })
    await fse.writeFile(
      path.join(targetPath, "common/Index.ets"),
      (await fse.readFile(path.join(__dirname, "./hm/common/Index.ets"), 'utf-8'))
        .replace(
          "{ domain: undefined }",
          `{ domain: ${data.appConfig?.defaultCallServiceHost ? JSON.stringify(data.appConfig?.defaultCallServiceHost) : undefined}}`,
        )
        .replace("$r('app.common.component.import')", importComponentCode ? `import { ${importComponentCode} } from "../comlib/Index"` : "")
        .replace("$r('app.common.component.declared')", declaredComponentCode)
    );
  }
}

const copyJs = async (params, config) => {
  const { data } = params;
  const { targetPath } = config;
  const jsCodePath = path.join(targetPath, "common/JSModules.ts");
  await fse.ensureFile(jsCodePath)
  await fse.writeFile(jsCodePath, `export default function({ createJSHandle, context }) {
      const comModules = {};
      ${decodeURIComponent(data.allModules?.all)};
      return comModules;
    }`, { encoding: "utf8" })
}

const getApiCode = async (params, config) => {
  const { data, fileId } = params;
  const { toJson, download } = data;
  const { router } = download;
  const { targetPath } = config;

  const eventTitles = toJson.frames.filter((frame) => {
    return frame.type === "extension-event"
  }).map((frame) => frame.title);

  const apiCode = await fse.readFile(path.join(targetPath, "api.ets"), "utf-8");
  return apiCode
    .replace("$r('app.api.import.utils')",
      `import { MyBricks, transformApi, createBus, transformBus } from "${RENDER_UTILS_PACKAGE_NAME}";`
      // download.source === "sourceCode" ?
      //   'import { MyBricks } from "./utils/types";\nimport { transformApi, createBus, transformBus } from "./utils/mybricks"\n;' :
      //   'import { MyBricks, transformApi, createBus, transformBus } from "@mybricks/render-utils";'
    )
    .replace("$r('app.api.export.pageUrl')",
      router === "HMRouter" ? `export const PAGE_URL = "myBricks${fileId}"` : ""
    )
    .replace("$r('app.api.router.open')",
      router === "HMRouter" ? "HMRouterMgr.push({ pageUrl: PAGE_URL })" : "navigation.push()"
    )
    .replace("$r('app.api.router.close')",
      router === "HMRouter" ? "HMRouterMgr.pop()" : "navigation.pop()"
    )
    .replace("$r('app.api.import.appRouter')",
      router === "HMRouter" ? 'import { HMRouterMgr } from "@hadss/hmrouter"' : "import { navigation, NavConfig } from './utils/AppRouter'"
    ).replace("$r('app.api.export.pagconfigNavigationUrl')", router === "HMRouter" ? '' : '/** 配置页面跳转要使用的路由 */\nexport const configNavigation = (navConfig: NavConfig) => {\n  navigation.registConfig(navConfig)\n}') +
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
}

const copyProject = async (params, config) => {
  const { data } = params;
  const { download } = data;
  const { targetPath } = config;

  await fse.copy(path.join(__dirname, "./hm/Component/api.ets"), path.join(targetPath, "api.ets"), { overwrite: true })

  if (download.router === "HMRouter") {
    await fse.copy(path.join(__dirname, "./hm/Component/HMRouterIndex.ets"), path.join(targetPath, "Index.ets"), { overwrite: true })
  } else {
    await fse.copy(path.join(__dirname, "./hm/Component/NavigationIndex.ets"), path.join(targetPath, "Index.ets"), { overwrite: true })
  }

}

const handleHSP = async (params, config) => {
  const { data } = params;
  const { download } = data;
  const { targetPath } = config;

  const name = download.fileName || "module";

  let ohPackage = fse.readFileSync(path.join(targetPath, "./oh-package.json5"), "utf-8")
  ohPackage = ohPackage.replace("--replace-name--", name.toLowerCase());
  if (download.source === "ohpmLibrary") {
    ohPackage = ohPackage.replace(
      "--replace-dependencies--", 
      '"@mybricks/render-utils": "latest",\n' + 
      '    "@mybricks/comlib-harmony-normal": "latest"'
    )
  } else {
    ohPackage = ohPackage.replace(
      "--replace-dependencies--",
      '"dayjs": "latest",\n' + 
      '    "@ohos/axios": "latest",\n' +
      '    "@mybricks/render-utils": "latest"'
    )
  }

  fse.writeFileSync(path.join(targetPath, "./oh-package.json5"), ohPackage)

  let module = fse.readFileSync(path.join(targetPath, "./src/main/module.json5"), "utf-8")
  module = module.replace("--replace-name--", name);

  fse.writeFileSync(path.join(targetPath, "./src/main/module.json5"), module)
}

/** 下载模块 */
const compilerHarmonyModule = async (params, config) => {
  const { data, projectPath } = params;
  const { download } = data;
  const fileNameMap = {};
  Logger.info("[AppHarmonyModule - compiler] - generatePageCodeWithMetadata")
  const { pageCode, importComponentCode, declaredComponentCode } = await generatePageCodeWithMetadata(params);
  Logger.info("[AppHarmonyModule - compiler] - generatePageCodeWithMetadata Done")

  // 目标项目路径
  let targetPath = path.join(projectPath, download.fileName || "module");

  if (download.integrationType === "HSP") {
   await fse.copy(path.join(__dirname, "./template/hsp"), targetPath);
   await handleHSP(params, { targetPath })
   targetPath = path.join(targetPath, "/src/main/ets");
  }

  Logger.info(`[AppHarmonyModule - compiler] - copyProject`)
  // 拷贝项目
  await copyProject(params, { targetPath });

  Logger.info(`[AppHarmonyModule - compiler] - handleReadMeCode`)
  // 写入README.md [TODO] 放最后处理
  await fse.writeFile(
    path.join(targetPath, "README.md"),
    handleReadMeCode(params),
    { encoding: "utf8" }
  );

  Logger.info(`[AppHarmonyModule - compiler] - copyComlib`)
  // 拷贝组件库
  await copyComlib(params, {
    targetPath
  })

  Logger.info(`[AppHarmonyModule - compiler] - copyUtils`)
  // 拷贝utils
  await copyUtils(params, {
    targetPath
  })

  Logger.info(`[AppHarmonyModule - compiler] - copyComponents`)
  await copyComponents(params, {
    targetPath,
    importComponentCode,
    declaredComponentCode
  })

  Logger.info(`[AppHarmonyModule - compiler] - getApiCode`)
  let apiCode = await getApiCode(params, {
    targetPath
  })

  const sceneMap = {};
  const moduleNames = new Set<string>();

  let extensionApiCode = "";

  Logger.info(`[AppHarmonyModule - compiler] - 遍历pageCode写页面、模块、api等`)
  await Promise.all(pageCode.map(async (page) => {
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

    if (page.type === "global") {
      // 全局变量、全局Fx
      fse.outputFileSync(path.join(targetPath, `common/global.ets`), handleGlobalCode(page, { params }), { encoding: "utf8" })
      return
    }

    if (page.type === "module") {
      const fileName = page.name
      fileNameMap[page.meta.id] = page.name;
      moduleNames.add(fileName);
      let content = handleModuleCode(page, { params });
      fse.outputFileSync(path.join(targetPath, `sections/${fileName}.ets`), content, { encoding: "utf8" })
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

    const fileName = page.name;
    fileNameMap[page.meta.id] = page.name;

    fse.outputFileSync(path.join(targetPath, `pages/${fileName}.ets`), content, { encoding: "utf8" })
  }))

  apiCode = apiCode.replace("$r('app.api.apis')", extensionApiCode).replace("$r('app.api.import')", "").replace("$r('app.api.config')", "() => {}");

  if (moduleNames.size) {
    Logger.info(`[AppHarmonyModule - compiler] - 补充区块入口`)
    // 有区块，补充区块的入口文件
    fse.outputFileSync(
      path.join(targetPath, `sections/Index.ets`),
      Array.from(moduleNames).reduce((pre, cur) => {
        return pre + `export { default as ${cur} } from "./${cur}"\n`
      }, ""),
      { encoding: "utf8" })
  } else {
    const IndexPath = path.join(targetPath, "Index.ets");
    fse.writeFileSync(
      IndexPath, 
      fse.readFileSync(IndexPath, "utf-8").replace(
        'export * from "./sections/Index"\n', ""
      ))
  }

  Logger.info(`[AppHarmonyModule - compiler] - api`)
  await fse.writeFile(path.join(targetPath, "api.ets"), apiCode)

  Logger.info(`[AppHarmonyModule - compiler] - copyJs`)
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
  Logger.info(`[AppHarmonyModule - compiler] - copy pages 主入口文件`)
  await fse.copy(path.join(__dirname, "./hm/pages/Index.ets"), entryPath, { overwrite: true });

  Logger.info(`[AppHarmonyModule - compiler] - 读 pages 主入口文件`)
  let entryFileContent = await fse.readFile(entryPath, 'utf-8')

  entryFileContent = handleEntryCode(entryFileContent, {
    normalScenes,
    tabbarScenes,
    tabbarConfig,
    entryScene,
    fileNameMap
  })
  Logger.info(`[AppHarmonyModule - compiler] - 写 pages 主入口文件`)
  await fse.writeFile(entryPath, entryFileContent, 'utf-8')
}
