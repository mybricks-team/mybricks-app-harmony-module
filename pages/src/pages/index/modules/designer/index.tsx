import React, {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect
} from "react";
import { message, notification } from "antd";
import { pageModel, userModel, contentModel, versionModel } from "@/stores";
import axios from "axios";
import dayjs from "dayjs";
import API from "@mybricks/sdk-for-app/api";
import styles from "./index.less";
import { getHarmonyJson } from "./get-compile-json";
import { handlePublishErrCode } from "./../publishModal";
import AppToolbar from "./toolbar";
import config from "./app-config";
import { useFxServices } from "../utils/use-fx-services";
import { sleep } from "@/utils";
import { DESIGNER_STATIC_PATH, HARMONY_COM_LIB } from "../../../../constants";
import { ExclamationCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import cloneDeep from "lodash/cloneDeep"
import { initOperableTips } from "./initOperableTips";
import { parse, modify, applyEdits } from "jsonc-parser";

function extractVersion(url = "") {
  // 使用正则表达式匹配版本号
  const regex = /\/(\d+\.\d+\.\d+)\/index\.min\.js/;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

function compareVersions(version1, version2) {
  // 将版本号分割成数组
  const v1Parts = version1.split(".").map(Number);
  const v2Parts = version2.split(".").map(Number);

  // 获取最长版本号的长度
  const maxLength = Math.max(v1Parts.length, v2Parts.length);

  // 比较每一位版本号
  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0; // 如果版本号位数不够，则使用 0
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) {
      return 1; // version1 大于 version2
    }
    if (v1Part < v2Part) {
      return -1; // version1 小于 version2
    }
  }

  return 0; // version1 等于 version2
}

let lastCooperationAry;

const Designer = ({ appData }) => {
  const [beforeunload, setBeforeunload] = useState(false);
  const [operable, setOperable] = useState(false);
  const [globalOperable, setGlobalOperable] = useState(false);
  const [roleDescription, setRoleDescription] = useState(-1);
  const designerRef = useRef<{ switchActivity; dump; toJSON }>();
  const [SPADesigner, setSPADesigner] = useState(null);

  useMemo(() => {
    (window as any).designerRef = designerRef
  }, [])

  const appConfig = useMemo(() => {
    let config = null;
    try {
      const originConfig = appData.config[APP_NAME]?.config || {};
      config =
        typeof originConfig === "string"
          ? JSON.parse(originConfig)
          : originConfig;
    } catch (error) {
      console.error("get appConfig error", error);
    }
    return config || {};
  }, [appData.config[APP_NAME]?.config]);

  const [ctx] = useState({
    sdk: appData,
    user: appData.user,
    comlibs: [],
    latestComlibs: [],
    hasMaterialApp: appData.hasMaterialApp,
    setting: appData.config || {},
  });

  const [latestComlibs, setLatestComlibs] = useState<[]>();

  const designer = useMemo(() => {
    const staticDesignerVerion = extractVersion(DESIGNER_STATIC_PATH);
    const dynamicDesignerVerion = extractVersion(appConfig?.designer?.url);

    // 如果静态版本号大于动态版本号，使用静态版本号
    if (staticDesignerVerion && dynamicDesignerVerion) {
      if (compareVersions(staticDesignerVerion, dynamicDesignerVerion) > 0) {
        return DESIGNER_STATIC_PATH;
      } else {
        return appConfig.designer?.url || DESIGNER_STATIC_PATH;
      }
    }
    return DESIGNER_STATIC_PATH;
  }, [appConfig]);

  const loadDesigner = useCallback(() => {
    if (designer) {
      const script = document.createElement('script')
      script.src = designer
      // script.src = 'https://f2.eckwai.com/kos/nlav12333/mybricks/designer-spa/3.9.842.r3/index.min.js'
      document.head.appendChild(script)
      script.onload = () => {
        ;(window as any).mybricks.SPADesigner &&
          setSPADesigner((window as any).mybricks.SPADesigner)
      }
    }
  }, [designer])

  useLayoutEffect(() => {
    let hasMaterial = false
    // 兼容逻辑
    const currentComlibs = appData.fileContent?.content?.comlibs?.filter((comlib) => {
      if (comlib.defined) {
        // 我的组件
        return true
      } else if (comlib.material_id) {
        hasMaterial = true
        // 来自物料中心
        return true
      }
      // 清理脏数据
      return false;
    })

    if (currentComlibs?.length && !hasMaterial) {
      currentComlibs.push(HARMONY_COM_LIB.editJs)
    }

    appData.getInitComLibs({
      localComlibs: [HARMONY_COM_LIB.editJs],
      currentComlibs: currentComlibs?.length ? currentComlibs : null,
    }).then(({ comlibs, latestComlibs }) => {
      const newComlibs = comlibs
      ctx.comlibs = newComlibs;
      ctx.latestComlibs = latestComlibs;
    }).finally(loadDesigner)
  }, [designer])

  useEffect(() => {
    const needSearchComlibs = ctx.comlibs.filter(
      (lib) => lib.id !== "_myself_"
    );
    if (!!needSearchComlibs?.length) {
      API.Material.getLatestComponentLibrarys(
        needSearchComlibs.map((lib) => lib.namespace)
      ).then((res: any) => {
        const latestComlibs = (res || []).map((lib) => ({
          ...lib,
          ...JSON.parse(lib.content),
        }));
        setLatestComlibs(latestComlibs);
      });
    } else {
      setLatestComlibs([]);
    }
  }, [JSON.stringify(ctx.comlibs.map((lib) => lib.namespace))]);

  useMemo(() => {
    contentModel.initFromFileContent(pageModel.fileContent);
    contentModel.preloadOpenedPagesContent();
  }, []);

  useEffect(() => {
    contentModel.initDesigner(designerRef);
  }, []);

  useEffect(() => {
    if (beforeunload) {
      window.onbeforeunload = () => {
        return true;
      };
    } else {
      window.onbeforeunload = null;
    }
  }, [beforeunload]);

  const download = useCallback(({ type, filename = undefined, backEndProjectPath, localize = 0 }) => {
    return new Promise((resolve, reject) => {
      axios.get(`/api/harmony-module/download?fileId=${pageModel.fileId}&type=${type}&localize=${localize}`, {
        responseType: 'blob'
      })
        .then(response => {
          const url = window.URL.createObjectURL(response.data);
          const a = document.createElement('a');
          a.style = "display: none"; 
          a.href = url;
          a.download = filename || `${pageModel.fileId}-${type}.zip`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          resolve(true)
        })
        .catch(error => {
          console.error('导出失败:', error);
          reject();
        });
    })
  }, []);

  const showPublishLoading = useCallback(async () => {
    pageModel.publishLoading = true;
    // 有一些大项目后面会CPU 100%，先让loading展示出来
    await sleep(300);
  }, []);

  /**
   * 保存
   */
  const onSave = useCallback(async (tip = true) => {
    const userId = userModel.user?.id;
    if (!userId) {
      return true;
    }

    if (!pageModel.canSave) {
      return true;
    }

    await contentModel
      .save(ctx)
      .then((res) => {
        if (pageModel.isNew && window.__type__ === "mpa") {
          if (!!tip) {
            if (!res || !res.saves) {
              // const { canvas } = contentModel.editRecord;
              // const notSaves = []

              // Array.from(canvas).forEach((id, index) => {
              //   const page = pageModel.pages[id]
              //   if (page) {
              //     if (index === canvas.size - 1) {
              //       notSaves.push(<b style={{ color: "#FA6400" }}>{page.title}</b>)
              //     } else {
              //       notSaves.push(<><b style={{ color: "#FA6400" }}>{page.title}</b>，</>)
              //     }
              //   }
              // })
              const { notCanvasSaves, notModuleSaves } = res;

              notification.open({
                message: (
                  <div>
                    <CheckCircleFilled
                      style={{ color: "#52c41a", marginRight: 8 }}
                    />
                    <span>没有内容保存</span>
                  </div>
                ),
                placement: "top",
                description:
                  contentModel.editRecord.global ||
                  notCanvasSaves.length ||
                  notModuleSaves.length ? (
                    <div style={{ display: "flex" }}>
                      <div>
                        <ExclamationCircleFilled
                          style={{
                            color: "#faad14",
                            marginRight: 8,
                            marginLeft: 2,
                          }}
                        />
                        注意：
                      </div>
                      <div style={{ flex: 1 }}>
                        <div>以下内容未保存</div>
                        <div>
                          <div>
                            {contentModel.editRecord.global ? (
                              <>
                                <b style={{ color: "#FA6400" }}>
                                  应用配置(全局、插件)
                                  <span
                                    style={{
                                      fontWeight: 400,
                                      color: "black",
                                      fontSize: 12,
                                    }}
                                  >
                                    {" "}
                                    - 没有应用锁
                                  </span>
                                </b>
                              </>
                            ) : null}
                          </div>
                          <div>
                            {notCanvasSaves.map(({ title }, index) => (
                              <>
                                <b style={{ color: "#FA6400" }}>{title}</b>
                                {notCanvasSaves.length - 1 === index
                                  ? ""
                                  : "，"}
                              </>
                            ))}
                            {notCanvasSaves.length ? (
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "black",
                                  fontSize: 12,
                                }}
                              >
                                {" "}
                                - 没有画布锁
                              </span>
                            ) : null}
                          </div>
                          <div>
                            {notModuleSaves.map(({ title }, index) => (
                              <>
                                <b style={{ color: "#FA6400" }}>{title}</b>
                                {notModuleSaves.length - 1 === index
                                  ? ""
                                  : "，"}
                              </>
                            ))}
                            {notModuleSaves.length ? (
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "black",
                                  fontSize: 12,
                                }}
                              >
                                {" "}
                                - 没有模块锁
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null,
              });
            } else {
              const { notCanvasSaves, notModuleSaves } = res;
              if (pageModel.globalOperable) {
                // 还要判断下有没有全局的修改
                notification.open({
                  message: (
                    <div>
                      <CheckCircleFilled
                        style={{ color: "#52c41a", marginRight: 8 }}
                      />
                      <span>保存完成</span>
                    </div>
                  ),
                  placement: "top",
                  description:
                    notCanvasSaves.length || notModuleSaves.length ? (
                      <div style={{ display: "flex" }}>
                        <div>
                          <ExclamationCircleFilled
                            style={{
                              color: "#faad14",
                              marginRight: 8,
                              marginLeft: 2,
                            }}
                          />
                          注意：
                        </div>
                        <div style={{ flex: 1 }}>
                          <div>以下内容未保存</div>
                          <div>
                            {notCanvasSaves.map(({ title }, index) => (
                              <>
                                <b style={{ color: "#FA6400" }}>{title}</b>
                                {notCanvasSaves.length - 1 === index
                                  ? ""
                                  : "，"}
                              </>
                            ))}
                            {notCanvasSaves.length ? (
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "black",
                                  fontSize: 12,
                                }}
                              >
                                {" "}
                                - 没有画布锁
                              </span>
                            ) : null}
                          </div>
                          <div>
                            {notModuleSaves.map(({ title }, index) => (
                              <>
                                <b style={{ color: "#FA6400" }}>{title}</b>
                                {notModuleSaves.length - 1 === index
                                  ? ""
                                  : "，"}
                              </>
                            ))}
                            {notModuleSaves.length ? (
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "black",
                                  fontSize: 12,
                                }}
                              >
                                {" "}
                                - 没有模块锁
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginLeft: 24 }}>修改内容都已保存</div>
                    ),
                });
                if(notCanvasSaves.length || notModuleSaves.length){
                  setBeforeunload(true)
                }else{
                  setBeforeunload(false)
                }
              } else {
                notification.open({
                  message: (
                    <div>
                      <CheckCircleFilled
                        style={{ color: "#52c41a", marginRight: 8 }}
                      />
                      <span>保存完成</span>
                    </div>
                  ),
                  placement: "top",
                  // description: notSaves.length ? (
                  //   <div style={{ display: 'flex' }}>
                  //     <div><ExclamationCircleFilled style={{color: "#faad14", marginRight: 8, marginLeft: 2}}/>注意：</div>
                  //     <div style={{ flex: 1 }}>
                  //       <div>以下内容未保存</div>
                  //       <div>
                  //         {contentModel.editRecord.global ? <><b style={{ color: "#FA6400" }}>应用配置(全局、插件) <span style={{fontWeight: 400, color: "black", fontSize: 12}}>- 没有应用锁</span></b>，</> : null}
                  //         {notSaves.map(({ title }, index) => {
                  //           return (
                  //             <>
                  //               <b style={{ color: "#FA6400" }}>{title}</b>{index === notSaves.length - 1 ? "" : "，"}
                  //             </>
                  //           )
                  //         })}
                  //       </div>
                  //     </div>
                  //   </div>
                  // ) : (contentModel.editRecord.global ? (
                  //   <div style={{ display: 'flex' }}>
                  //     <div><ExclamationCircleFilled style={{color: "#faad14", marginRight: 8, marginLeft: 2}}/>注意：</div>
                  //     <div style={{ flex: 1 }}>
                  //       <div>以下内容未保存</div>
                  //       <div>
                  //         <b style={{ color: "#FA6400" }}>应用配置(包含全局、模块、插件) <span style={{fontWeight: 400, color: "black", fontSize: 12}}>- 没有应用锁</span></b>
                  //       </div>
                  //     </div>
                  //   </div>
                  // ) : (
                  //   <div style={{ marginLeft: 24 }}>修改内容都已保存</div>
                  // ))
                  description:
                    contentModel.editRecord.global ||
                    notCanvasSaves.length ||
                    notModuleSaves.length ? (
                      <div style={{ display: "flex" }}>
                        <div>
                          <ExclamationCircleFilled
                            style={{
                              color: "#faad14",
                              marginRight: 8,
                              marginLeft: 2,
                            }}
                          />
                          注意：
                        </div>
                        <div style={{ flex: 1 }}>
                          <div>以下内容未保存</div>
                          <div>
                            <div>
                              {contentModel.editRecord.global ? (
                                <>
                                  <b style={{ color: "#FA6400" }}>
                                    应用配置(全局、插件)
                                    <span
                                      style={{
                                        fontWeight: 400,
                                        color: "black",
                                        fontSize: 12,
                                      }}
                                    >
                                      {" "}
                                      - 没有应用锁
                                    </span>
                                  </b>
                                </>
                              ) : null}
                            </div>
                            <div>
                              {notCanvasSaves.map(({ title }, index) => (
                                <>
                                  <b style={{ color: "#FA6400" }}>{title}</b>
                                  {notCanvasSaves.length - 1 === index
                                    ? ""
                                    : "，"}
                                </>
                              ))}
                              {notCanvasSaves.length ? (
                                <span
                                  style={{
                                    fontWeight: 400,
                                    color: "black",
                                    fontSize: 12,
                                  }}
                                >
                                  {" "}
                                  - 没有画布锁
                                </span>
                              ) : null}
                            </div>
                            <div>
                              {notModuleSaves.map(({ title }, index) => (
                                <>
                                  <b style={{ color: "#FA6400" }}>{title}</b>
                                  {notModuleSaves.length - 1 === index
                                    ? ""
                                    : "，"}
                                </>
                              ))}
                              {notModuleSaves.length ? (
                                <span
                                  style={{
                                    fontWeight: 400,
                                    color: "black",
                                    fontSize: 12,
                                  }}
                                >
                                  {" "}
                                  - 没有模块锁
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginLeft: 24 }}>修改内容都已保存</div>
                    ),

                });
                if(contentModel.editRecord.global ||
                  notCanvasSaves.length ||
                  notModuleSaves.length){
                  setBeforeunload(true)
                }else{
                  setBeforeunload(false)
                }
              }
            }
          }
        } else {
          !!tip && message.success("保存完成");
          setBeforeunload(false);
        }

      })
      .catch((e) => {
        !!tip && message.error(`保存失败：${e.message}`);
        setBeforeunload(false);
      });

    // 同时保存下图片
    // 如果不保存图片呢？保存图片有点bug
    // API.App.getPreviewImage({
    //   element: designerRef.current?.geoView.canvasDom?.firstChild,
    // })
    //   .then((res) => {
    //     // @ts-ignore
    //     return API.File.save({
    //       userId: userModel.user?.id,
    //       fileId: pageModel.fileId,
    //       icon: res,
    //     });
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });
  }, []);

  const onPublish = useCallback(
    async () => {
      // 没上锁也要能发布
      // if (!pageModel.operable) {
      //   // 没有页面级权限
      //   return true;
      // }
      if (pageModel?.publishLoading) {
        return;
      }
      await showPublishLoading();

      await onSave(false);

      const type = "publishModule";

      try {
        const toJson = await contentModel.toJSON({
          withDiagrams: true,
          withIOSchema: true,
          getNewJSON(json) {
            json.scenes.forEach((scene) => {
              if (scene.type) {
                return
              }
              const { slot, coms } = scene;
              const { comAry } = slot;
              if (comAry?.[0]?.def.namespace !== "mybricks.harmony.systemPage") {
                return
              }
              const systemPageComAry = []
              const fixedComAry = []
              comAry[0].slots?.content?.comAry?.forEach((com) => {
                const comInfo = coms[com.id]
                if (comInfo.model.style.position === "fixed") {
                  fixedComAry.push(com)
                } else {
                  systemPageComAry.push(com)
                }
              })
              if (fixedComAry.length) {
                slot.comAry.push(...fixedComAry)
                comAry[0].slots.content.comAry = systemPageComAry
              }
            })
            return json
          }
        });

        const json = await getHarmonyJson({
          toJson: cloneDeep(toJson),
          comlibs: [...ctx.comlibs],
          appConfig: {
            defaultCallServiceHost:  pageModel.appConfig?.defaultCallServiceHost,
          }
        })

        const res = await axios({
          url:  "/api/harmony-module/publish",
          method: "POST",
          data: {
            userId: userModel.user?.id,
            fileId: pageModel.fileId,
            fileName: pageModel.file.name,
            type,
            data: {
              ...json,
              toJson,
              sectionsMap: designerRef.current.getSections()?.reduce((sectionsMap, section) => {
                sectionsMap[section.id] = {
                  previewImageData: section.previewImageData
                }
                return sectionsMap
              }, {}) || {}
            }
          },
          withCredentials: false,
        });
        let data = res.data;
        pageModel.publishLoading = false;
        if (data.code !== 1) {
          handlePublishErrCode(data);

          if (data.innerMessage) {
            message.error(data.innerMessage);
          }
          return;
        }
        message.success("发布成功")
      } catch (e) {
        console.error(e);
        message.error(e?.message ?? "发布失败，请重试");
        console.error(e?.message ?? "发布失败，请重试");
      }

      pageModel.publishLoading = false;
    },
    [onSave]
  );

  const onCompile = useCallback(
    async (params) => {
      const close = message.loading({
        key: 'download',
        content: '导出中...',
        duration: 0,
      })

      await sleep(300);

      const type = "harmonyModule"

      try {
        const toJson = await contentModel.toJSON({
          withDiagrams: true,
          withIOSchema: true,
          getNewJSON(json) {
            json.scenes.forEach((scene) => {
              if (scene.type) {
                return
              }
              const { slot, coms } = scene;
              const { comAry } = slot;
              if (comAry?.[0]?.def.namespace !== "mybricks.harmony.systemPage") {
                return
              }
              const systemPageComAry = []
              const fixedComAry = []
              comAry[0].slots?.content?.comAry?.forEach((com) => {
                const comInfo = coms[com.id]
                if (comInfo.model.style.position === "fixed") {
                  fixedComAry.push(com)
                } else {
                  systemPageComAry.push(com)
                }
              })
              if (fixedComAry.length) {
                slot.comAry.push(...fixedComAry)
                comAry[0].slots.content.comAry = systemPageComAry
              }
            })
            return json
          }
        });

        let comlibs = [...ctx.comlibs];
        if (window.__DEBUG_COMLIB__) {
          let containIndex = comlibs.findIndex((lib) => {
            return (
              lib.id === window.__DEBUG_COMLIB__.id ||
              lib.namespace === window.__DEBUG_COMLIB__.namespace
            );
          });

          if (containIndex > -1) {
            comlibs.splice(containIndex, 1, window.__DEBUG_COMLIB__);
          } else {
            comlibs.push(window.__DEBUG_COMLIB__);
          }
        }

        const json = await getHarmonyJson({
          toJson: {
            ...toJson,
          },
          comlibs: comlibs,
          appConfig: {
            defaultCallServiceHost:  pageModel.appConfig?.defaultCallServiceHost,
          },
          download: params,
        })

        const getComponentMetaMap = () => {
          const componentMetaMap = {};
        
          (window as any).__comlibs_edit_.forEach(({ id, namespace, comAray }) => {
            if (id && namespace) {
              traverseComAry(comAray, id);
            }
          })
        
          function traverseComAry(comAry, npm) {
            comAry.forEach((com) => {
              if (Array.isArray(com.comAray)) {
                traverseComAry(com.comAray, npm);
              } else {
                componentMetaMap[com.namespace] = {
                  hasSlots: !!com.slots
                }
              }
            });
          }
        
          return componentMetaMap;
        }

        const res = await axios({
          url: "/api/harmony-module/harmony/compile",
          method: "POST",
          data: {
            userId: userModel.user?.id,
            fileId: pageModel.fileId,
            fileName: pageModel.file.name,
            type,
            data: {
              ...json,
              comlibs: ctx.comlibs.filter((comlib) => {
                return comlib.material_id
              }),
              services: toJson.services,
              serviceFxUrl: pageModel.appConfig.serviceFxUrl,
              database: pageModel.appConfig.datasource,
              toJson,
              componentMetaMap: getComponentMetaMap(),
              installedModules: designerRef.current.getInstalledModules(),
              download: params,
              basic: {
                name: pageModel.file.name,
                version: versionModel.file.version,
                link: location.href,
                author: pageModel.file.creatorName,
                updateTime: dayjs(pageModel.file.updateTime || pageModel.file._updateTime || pageModel.file.createTime || pageModel.file._createTime).format("YYYY-MM-DD HH:mm:ss"),
                updater: pageModel.file.updatorName || pageModel.file.creatorName
              },
              // fileNameMap
            },
          },
          withCredentials: false,
        });
        let data = res.data;
        pageModel.publishLoading = false;
        
        if (data.code !== 1) {
          if (data.innerMessage) {
            message.error(`导出失败: ${data.innerMessage}！请重试`);
          } else {
            message.error(`导出失败: ${data.message || data.msg}！请重试`)
            console.error("导出失败:", data);
          }
          close()
          return;
        }

        if (!params.fse) {
          download({
            type,
            backEndProjectPath: data?.data?.backEndProjectPath,
            filename: `${params.fileName}.zip`,
          })
            .then(() => {
              message.success("导出完成")
              // 添加下载记录
              axios.post(
                "/api/harmony-module/addDownloadRecord",
                {
                  userId: userModel.user?.id,
                  fileId: pageModel.fileId,
                  content: {
                    // 版本
                    saveVersion: versionModel.file.version,
                  }
                }
              );
            })
            .catch((e) => {
              message.error(`导出失败: ${e.message || e.msg}！请重试`)
            })
            .finally(() => {
              close()
            })
        } else {
          try {
            const fileHandle = await (params.fse as FileSystemDirectoryHandle).getFileHandle('build-profile.json5');
            const file = await fileHandle.getFile();
            const contents = await file.text();
            const json = parse(contents);

            if (!json.modules.find((module) => module.name === params.fileName)) {
              // 没有相同的module name 写文件
              const edits = modify(contents, ['modules', 10000], {
                "name": params.fileName,
                "srcPath": `./${params.fileName}`,
                "targets": [
                  {
                    "name": "default",
                    "applyToProducts": [
                      "default"
                    ]
                  }
                ]
              }, {
                formattingOptions: {
                  insertSpaces: true,
                  tabSize: 2
                },
                isArrayInsertion: true
              })
              const newContents = applyEdits(contents, edits);
              const writable = await fileHandle.createWritable();
              await writable.write(newContents);
              await writable.close();    
            }        
          } catch (e) {
            console.error("[FileSystemDirectoryHandle.getFileHandle]", e)
          }

          axios.get(`/api/harmony-module/download2?fileId=${pageModel.fileId}&type=${type}`)
            .then(async ({ data: { data } }) => {
              console.log("[data]", data)
              async function deep(data, handle: FileSystemDirectoryHandle) {
                if (data.type === "directory") {
                  const nextHandle = await handle.getDirectoryHandle(data.fileName, {
                    create: true,
                  });

                  if (data.children) {
                    await Promise.all(data.children.map((children) => {
                      return deep(children, nextHandle)
                    }))
                  }
                } else if (data.type === "file") {
                  const fileHandle = await handle.getFileHandle(data.fileName, { create: true });
                  const writable = await fileHandle.createWritable();
                  if (/\.(jpg|jpeg|png|gif|webp|svg|ico|bmp|tiff|avif)$/i.test(data.fileName)) {
                    const res = await axios.get(
                      `/api/harmony-module/getTmpFile?tmpPath=${data.content}`,
                      {
                        responseType: 'blob'
                      }
                    );
                    await writable.write(res.data)
                  } else {
                    await writable.write(data.content);
                  }
                  await writable.close();
                }
              }

              const time = new Date().getTime()
              await deep(data, params.fse)
              console.log("[download - 写文件耗时]", new Date().getTime() - time)

              message.success("导出完成")
              // 添加下载记录
              axios.post(
                "/api/harmony-module/addDownloadRecord",
                {
                  userId: userModel.user?.id,
                  fileId: pageModel.fileId,
                  content: {
                    // 版本
                    saveVersion: versionModel.file.version,
                  }
                }
              );
            })
            .catch((e) => {
              message.error(`导出失败: ${e.message || e.msg}！请重试`)
            })
            .finally(() => {
              close()
            })
        }
      } catch (e) {
        message.error(`导出失败: ${e.message || e.msg}！请重试`)
        console.error("导出失败:", e);
        close();
      }
    },
    []
  );

  const onEdit = useCallback((info) => {
    // console.log("info => ", info)
    const { id, type } = info;
    switch (type) {
      case "global":
        contentModel.editRecord.global = true;
        break;
      case "module":
        contentModel.editRecord.module.add(id);
        break;
      case "canvas":
        contentModel.editRecord.canvas.add(id);
        break;
    }
    contentModel.operationList.current.push({
      ...info,
      detail: info.title,
      updateTime: dayjs(),
    });
    setBeforeunload(true);
  }, []);

  const onMessage = useCallback((type, msg) => {
    message.destroy();
    message[type](msg);
  }, []);

  const FxService = useFxServices();

  return (
    <div className={styles.show}>
      <AppToolbar
        operable={operable}
        globalOperable={globalOperable}
        roleDescription={roleDescription}
        statusChange={({ status, file, extraFiles, isNew, init, roleDescription }) => {
          // setOperable(status === 1);
          let operable = status === 1;
          pageModel.operable = status === 1;
          pageModel.globalOperable = status === 1;
          pageModel.extraFiles = extraFiles;
          pageModel.isNew = isNew;
          pageModel.file = file;
          versionModel.compare(file);
          setRoleDescription(roleDescription);

          if (!isNew || window.__type__ === "spa") {
            pageModel.canSave = operable;
            if (init && !operable) {
              initOperableTips({
                type: "spa",
              })
            }
            setOperable(operable);
            setGlobalOperable(operable);
            return;
          }

          const user = userModel.user;
          const cooperationAry = [];
          if (status === 1) {
            cooperationAry.push({
              type: "global",
              users: [
                {
                  id: user.id,
                  name: user.name || user.email,
                  isMe: true,
                  avatarUrl:
                    user.avatar === "/default_avatar.png" ? null : user.avatar,
                  readable: true,
                  writeable: true,
                },
              ],
            });
            setGlobalOperable(true);
          } else {
            cooperationAry.push({
              type: "global",
              users: [],
            });
            setGlobalOperable(false);
          }

          Object.entries(pageModel.pages).forEach(([pageId, pageInfo]) => {
            const extraFile = pageModel.extraFiles[pageInfo.fileId];
            if (extraFile.id) {
              if (user.id === extraFile.id) {
                operable = true;
              }
              cooperationAry.push({
                type: "canvas",
                canvasId: pageId,
                users: [
                  {
                    id: extraFile.id,
                    name: extraFile.name || extraFile.email || extraFile.userId,
                    isMe: user.id === extraFile.id,
                    avatarUrl:
                      extraFile.avatar === "/default_avatar.png"
                        ? null
                        : extraFile.avatar,
                    readable: true,
                    writeable: true,
                  },
                ],
              });
            } else {
              cooperationAry.push({
                type: "canvas",
                canvasId: pageId,
                // users: []
                users: [
                  // {
                  //   id: user.id,
                  //   name: user.name,
                  //   isMe: false,
                  //   avatarUrl: user.avatar,
                  //   readable: true,
                  //   writeable: false
                  // },
                  // {
                  //   id: user.id,
                  //   name: "H",
                  //   isMe: true,
                  //   avatarUrl: user.avatar,
                  //   readable: true,
                  //   writeable: false
                  // }
                ],
                // users: [
                //   {
                //     id: extraFile.id,
                //     name: extraFile.name,
                //     isMe: user.id === extraFile.id,
                //     avatarUrl: extraFile.avatar,
                //     // avatarUrl: 'https://resources-live.sketch.cloud/default_avatars/s/3.png',
                //     readable: true,
                //     writeable: user.id === extraFile.id
                //   }
                // ]
              });
            }
          });

          pageModel.canSave = operable;
          setOperable(operable);

          if (init && !operable) {
            initOperableTips({
              type: "mpa",
            })
          }

          // console.log("cooperationAry => ", cooperationAry)

          if (!designerRef.current) {
            lastCooperationAry = cooperationAry;
          } else {
            designerRef.current?.setCooperationAry(cooperationAry);
          }
        }}
        toggleLock={(status) => {
          message.success(status === 1 ? "上锁成功" : "解锁成功")
        }}
        isModify={beforeunload}
        onSave={onSave}
        onCompile={onCompile}
        onPublish={onPublish}
        designerRef={designerRef}
        setBeforeunload={setBeforeunload}
      />
      <div className={styles.designer}>
        {SPADesigner && latestComlibs && window?.mybricks?.createObservable && (
          <SPADesigner
            config={config({
              ctx: window?.mybricks?.createObservable(
                Object.assign(ctx, { latestComlibs })
              ),
              appData,
              pageModel: window?.mybricks?.createObservable(pageModel),
              save: onSave,
              designerRef,
              FxService,
              appConfig,
              setOperable,
            })}
            ref={designerRef}
            onEdit={onEdit}
            onMessage={onMessage}
            onLoad={() => {
              if (
                pageModel.isNew &&
                lastCooperationAry &&
                window.__type__ === "mpa"
              ) {
                designerRef.current.setCooperationAry(lastCooperationAry);
                lastCooperationAry = null;
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Designer;
