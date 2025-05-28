import toHarmonyCode from "@mybricks/to-code-react/dist/cjs/toHarmonyCode"
import * as path from "path";
import * as fse from "fs-extra";
import { COMPONENT_PACKAGE_NAME } from "./hm/constant";
import { pinyin, cleanAndSplitString, firstCharToUpperCase } from "../utils";

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
  tabbarConfig
}) => {
  const allImports = Array.from(new Set([...tabbarScenes, ...normalScenes]))
    .map(scene => `// ${scene.title} \nimport ${generatePageFileName(scene.title)} from './${generatePageFileName(scene.title)}';`)
    .join('\n')
  const generateRoutes = (scenes) => scenes
    .map((scene, i) => `${i === 0 ? 'if' : '\t\telse if'} (path === '${scene.id}') {\n\t\t\t${generatePageFileName(scene.title)}()\n\t\t}`)
    .join('\n');
  const renderMainScenes = generateRoutes(Array.from(new Set([entryScene, ...tabbarScenes])))
  const renderScenes = generateRoutes(normalScenes)


  return template
    .replace("$r('app.config.imports')", allImports)
    .replace("$r('app.config.mainScenes')", renderMainScenes)
    .replace("$r('app.config.scenes')", renderScenes)
    .replace("$r('app.config.tabbar')", JSON.stringify(tabbarConfig, null, 2))
    .replace("$r('app.config.entry')", JSON.stringify(entryScene.id))
}

const handlePageCode = (page: ReturnType<typeof toHarmonyCode>[0], {
  disableScroll = false,
  statusBarStyle,
  navigationBarStyle,
  navigationBarTitleText,
  navigationStyle = 'default',
  showBackIcon = false
}) => {
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: "../utils/types",
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("controller:")) {
    page.importManager.addImport({
      packageName: COMPONENT_PACKAGE_NAME,
      dependencyNames: ["Controller"],
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

const handlePopupCode = (page: ReturnType<typeof toHarmonyCode>[0]) => {
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: "../utils/types",
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("controller:")) {
    page.importManager.addImport({
      packageName: COMPONENT_PACKAGE_NAME,
      dependencyNames: ["Controller"],
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
          .hideBackButton(true)
          .mode(NavDestinationMode.DIALOG)
          .systemTransition(NavigationSystemTransitionType.NONE)
        }
      }
  
      ${page.content}
      `;
}

export const compilerHarmony2 = async (params, config) => {
  await compilerHarmonyModule(params, config)
}

const generatePageFileName = (text: string) => {
  const splits = cleanAndSplitString(text);
  
  return splits.reduce((pre, cur) => {
    return pre + firstCharToUpperCase(pinyin.convertToPinyin(cur, "", true))
  }, "") + "Page"
}

const getPageCode = (toJson) => {
  return toHarmonyCode(toJson, {
    getComponentMetaByNamespace(namespace, config) {
      if (namespace === "mybricks.harmony._muilt-inputJs") {
        return {
          dependencyImport: {
            packageName: COMPONENT_PACKAGE_NAME,
            dependencyNames: ["codes"],
            importType: "named",
          },
          componentName: "codes"
        };
      }

      let componentName = convertNamespaceToComponentName(namespace);
      const dependencyNames: string[] = [];

      if (config.type === "js") {
        componentName = componentName[0].toLowerCase() + componentName.slice(1);
      }

      dependencyNames.push(componentName);
  
      return {
        dependencyImport: {
          packageName: COMPONENT_PACKAGE_NAME,
          dependencyNames,
          importType: "named",
        },
        componentName: componentName,
      };
    },
    getComponentPackageName() {
      return COMPONENT_PACKAGE_NAME
    }
  }).map((page) => {
    if (page.meta) {
      return {
        ...page,
        path: `pages/${generatePageFileName(page.meta.title)}.ets`,
      }
    }
    return page
  });
}

/** 下载模块 */
const compilerHarmonyModule = async (params, config) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId } = params;
  const { Logger } = config;
  const pageCode = getPageCode(data.toJson);

  // 目标项目路径
  const targetPath = path.join(projectPath, "module");

  // 拷贝项目
  await fse.copy(path.join(__dirname, "./hm/Component"), targetPath, { overwrite: true })
  // 拷贝comlib
  await fse.copy(path.join(__dirname, "./hm/comlib"), path.join(targetPath, "comlib"), { overwrite: true })
  // 拷贝utils
  await fse.copy(path.join(__dirname, "./hm/utils"), path.join(targetPath, "utils"), { overwrite: true })
  // 拷贝_proxy
  await fse.copy(path.join(__dirname, "./hm/_proxy"), path.join(targetPath, "_proxy"), { overwrite: true })
  let _proxyIndexCode = await fse.readFile(path.join(__dirname, "./hm/_proxy/Index.ets"), 'utf-8')

  let apiCode = await fse.readFile(path.join(targetPath, "api.ets"), "utf-8");
  apiCode = apiCode.replace("$r('app.config.pageUrl')", `"myBricks${fileId}"`);

  const sceneMap = {};

  pageCode.forEach((page) => {
    if (page.type === "extensionEvent") {
      apiCode = apiCode.replace("$r('app.api.import')", page.importManager.toCode()).replace("$r('app.api.open')", page.content)
      return
    }

    if (page.type === "globalVars") {
      _proxyIndexCode = _proxyIndexCode.replace("$r('app.context.globalVars')", page.content)
      return
    }

    if (page.type === "globalFxs") {
      fse.outputFileSync(path.join(targetPath, `_proxy/globalFxs.ets`), page.content, { encoding: "utf8" })
      return
    }

    if (page.meta) {
      sceneMap[page.meta.id] = page.meta;
    }

    let content = "";
    if (page.type === "ignore") {
      // 不做特殊处理，一般是固定模版代码
      content = page.content;
    } else if (page.type === "normal") {
      const { pageConfig } = data.pages.find(p => p.id === page.meta?.id) ?? {}
      // 页面
      content = handlePageCode(page, pageConfig);
    } else if (page.type === "popup") {
      // 弹窗
      content = handlePopupCode(page);
    }

    fse.outputFileSync(path.join(targetPath, page.path), content, { encoding: "utf8" })
  });

  await fse.writeFile(
    path.join(targetPath, "_proxy/Index.ets"),
    _proxyIndexCode
      .replace(
        "{ domain: undefined }",
        `{ domain: ${data.appConfig?.defaultCallServiceHost ? JSON.stringify(data.appConfig?.defaultCallServiceHost) : undefined}}`,
      )
  );
  await fse.writeFile(path.join(targetPath, "api.ets"), apiCode)

  // 写入搭建Js
  const jsCodePath = path.join(targetPath, "_proxy/codes.js");
  await fse.ensureFile(jsCodePath)
  await fse.writeFile(jsCodePath, `export default (function(comModules) {
    ${decodeURIComponent(data.allModules?.all)};
    return comModules;
  })({})`, { encoding: "utf8" })

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
    entryScene
  })
  await fse.writeFile(entryPath, entryFileContent, 'utf-8')
}
