import React, { useEffect, useState, useLayoutEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Form, Input, Select, Switch, message } from "antd";
import { pageModel } from "@/stores";
import css from "./ExportPanel.less";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
import classNames from "classnames";

// 是否可以使用该api
const canUseFSAccess = !!window.showDirectoryPicker;

interface ExportPanelProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: { 
    fileName: string;
    source: "ohpmLibrary" | "sourceCode";
    router: "Navigation" | "HMRouter";
    integrationType: "HSP" | "sourceCode";
    downloadApplication: boolean;
  }) => void;
}
const ExportPanel = (props: ExportPanelProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  const clickCancel = useCallback((e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      props.onCancel();
    }
  }, [])

  useEffect(() => {
    if (props.visible) {
      setShow(props.visible);
      window.addEventListener('click', clickCancel, true);
    } else {
      window.removeEventListener('click', clickCancel, true);
    }
  }, [props.visible])

  return show && createPortal(
    <div ref={ref} className={css.panel} style={{ display: props.visible ? "block" : "none" }}>
      <div className={css.title}>
        导出模块的源代码
      </div>
      <HarmonyRequireForm
        onCancel={props.onCancel}
        onOk={props.onOk}
        getPopupContainer={() => ref.current}
      />
    </div>,
    document.body
  )
}

const fileNamePattern = /^[A-Za-z][A-Za-z0-9_]{0,30}$/;

const verifyFileLife = async (handle: FileSystemDirectoryHandle) => {
  try {
    for await (const key of handle.entries()) {
      break;
    }
    return true;
  } catch (e) {
    // 目录已失效，可能是重命名、被删除、移动等
    console.log("[getTargetDirectoryStatus] - 目录已失效，可能是重命名、被删除、移动等")
    return false;
  }
}

// 获取当前状态
const getTargetDirectoryStatus = async (key: string) => {
  let directoryHandle: FileSystemDirectoryHandle
  try {
    directoryHandle = await idbGet(key);
  } catch (e) {
    console.error("[idb-keyval - get]", e);
  }
  if (!directoryHandle) {
    // 没有选择目录
    console.log("[getTargetDirectoryStatus] - 未选择目录")
    return {
      handle: null,
      status: -1,
      key
    }
  }

  // 权限校验
  const queryPermission = await directoryHandle.queryPermission({ mode: 'readwrite' });

  console.log(`[getTargetDirectoryStatus] - queryPermission: ${queryPermission}`);

  if (queryPermission !== "granted") {
    // 没有权限
    return {
      handle: directoryHandle,
      status: 0,
      key
    }
  }

  if (!await verifyFileLife(directoryHandle)) {
    // 有权限，但是文件不存在
    return {
      handle: directoryHandle,
      status: 0,
      key
    }
  }

  return {
    handle: directoryHandle,
    status: 1,
    key
  }
}

// 选择目录
const showDirectoryPicker = async (key: string) => {
  try {
    const directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    try {
      await idbSet(key, directoryHandle);
    } catch (e) {
      console.error("[idb-keyval - set]", e);
    }
    return directoryHandle;
  } catch {
    return;
  }
}

const HarmonyRequireForm = ({ onCancel, onOk, getPopupContainer }) => {
  const [form] = Form.useForm();
  const [fileNameError, setFileNameError] = useState(null);
  const [targetDirectoryStatus, setTargetDirectoryStatus] = useState(null);

  const genTargetDirectoryStatus = () => {
    return new Promise((resolve) => {
      getTargetDirectoryStatus(`${pageModel.file.id}_for_download_directoryhandle`)
        .then((status) => {
          setTargetDirectoryStatus(status);
          resolve(status);
        })
      })
  }

  useLayoutEffect(() => {
    form.setFieldsValue({
      fileName: pageModel.appConfig.download.fileName,
      source: pageModel.appConfig.download.source || "ohpmLibrary",
      router: pageModel.appConfig.download.router || "Navigation",
      integrationType: pageModel.appConfig.download.integrationType || "HSP",
      enableAI: false,
    })

    if (canUseFSAccess) {
      genTargetDirectoryStatus()
    }
  }, [])

  const showDirectoryPickerButtonClick = () => {
    showDirectoryPicker(targetDirectoryStatus.key)
      .then((handle) => {
        if (handle) {
          setTargetDirectoryStatus((status) => {
            return {
              ...status,
              status: 1,
              handle,
            }
          })
        }
        
      })
      .catch(() => {

      })
  }

  return (
    <div className={`${css.require} fangzhou-theme`}>
      <Form form={form} layout="vertical" size="small">
        <div className={css.formItem}>
          <Form.Item
            name="fileName"
            label="模块名称"
            validateStatus={fileNameError ? "error" : "success"}

          >
            <Input
              maxLength={31}
              placeholder="请输入模块名称"
              onChange={(e) => {
                if (fileNamePattern.test(e.target.value)) {
                  setFileNameError(null)
                } else {
                  setFileNameError("以字母开头，仅支持字母、数字以及下划线")
                }
              }}
            />
          </Form.Item>
          {fileNameError && <span className={css.fileNameError}>{fileNameError}</span>}
        </div>
        <Form.Item
          name="source"
          label="库依赖方式"
        >
          <Select
            placeholder="请选择库依赖方式"
            options={[
              {
                label: "ohpm三方库",
                value: "ohpmLibrary"
              },
              {
                label: "源码",
                value: "sourceCode"
              }
            ]}
            getPopupContainer={getPopupContainer}
          />
        </Form.Item>
        {/* <Form.Item
          name="router"
          label="路由方式"
        >
          <Select
            placeholder="请选择路由方式"
            options={[
              {
                label: "Navigation",
                value: "Navigation"
              },
              {
                label: "HMRouter",
                value: "HMRouter"
              }
            ]}
            getPopupContainer={getPopupContainer}
          />
        </Form.Item>
        <Form.Item
          name="integrationType"
          label="模块集成方式"
        >
          <Select
            placeholder="请选择模块集成方式"
            options={[
              {
                label: "HSP",
                value: "HSP"
              },
              {
                label: "源码",
                value: "sourceCode"
              },
            ]}
            getPopupContainer={getPopupContainer}
          />
        </Form.Item> */}
        <Form.Item
          name="enableAI"
          label="AI润色（Beta）"
          tooltip="通过AI对代码进行优化，提高可读性。"
        >
          <Switch />
        </Form.Item>

        {targetDirectoryStatus && (
          <div className={css.formItem}>
            <Form.Item
              name="moduleExportDirectory"
              label="模块导出目录"
              tooltip="配置目录后，可通过点击同步按钮将模块代码以写文件覆盖的形式直接同步至目标目录下"
            >
              {targetDirectoryStatus.status === -1 && (
                <button
                  className={classNames(css.button, css.configDirectoryButton)}
                  onClick={showDirectoryPickerButtonClick}
                >
                  配置目录
                </button>
              )}
              {(targetDirectoryStatus.status !== -1) && (
                <div className={css.targetDirectoryStatus1}>
                  <span className={classNames(css.span, {
                    [css.unlink]: targetDirectoryStatus.status !== 1
                  })}
                    data-mybricks-tip={targetDirectoryStatus.status === 0 ? "文件目录不存在或未授权，请点击重新选择" : ""}
                    onClick={showDirectoryPickerButtonClick}
                  >
                    {targetDirectoryStatus.handle.name}
                  </span>
                  <button
                    className={css.button}
                    onClick={() => {
                      setTargetDirectoryStatus((status) => {
                        return {
                          ...status,
                          handle: null,
                          status: -1
                        }
                      })

                      try {
                        idbDel(targetDirectoryStatus.key)
                      } catch (e) {
                        console.error("[idb-keyval - del]", e);
                      }
                    }}
                  >重置</button>
                </div>
              )}
            </Form.Item>
          </div>
        )}
      </Form>

      <div className={css.help}>
        <div className={css.tips}>使用步骤及注意事项</div>
        <div className={css.listItem}>1.导出当前模块的源代码；</div>
        <div className={css.listItem}>2.解压并拷贝至应用工程的ets目录下；</div>
        <div className={css.listItem}>3.阅读模块内的README.md文件，了解如何使用；</div>
      </div>

      <div className={css.footer}>
        <button className={css.button} onClick={onCancel}>取消</button>
        <button disabled={fileNameError} className={`${css.button}`} onClick={() => {
          form
            .validateFields()
            .then((values) => {
              onOk?.({
                ...values,
                router: "Navigation",
                integrationType: "HSP",
                fileName: (values.fileName).trim() || pageModel.appConfig.download.fileName,
                downloadApplication: true
              });
            })
        }}
        data-mybricks-tip={`{content:'应用仅适用于开发阶段，方便调试模块',position:'top'}`}>导出应用</button>
        <button disabled={fileNameError} className={`${css.button} ${css.mainButton}`} onClick={() => {
          form
            .validateFields()
            .then((values) => {
              onOk?.({
                ...values,
                router: "Navigation",
                integrationType: "HSP",
                fileName: (values.fileName).trim() || pageModel.appConfig.download.fileName,
                fse: null
              });
            })
        }}>导出模块</button>
        {targetDirectoryStatus?.status !== -1 && <button
          disabled={fileNameError || (targetDirectoryStatus?.status !== 1)}
          className={`${css.button} ${css.mainButton}`}
          onClick={() => {
            genTargetDirectoryStatus().then(({ status, handle }: any) => {
              if (status === 1) {
                form
                  .validateFields()
                  .then((values) => {
                    onOk?.({
                      ...values,
                      router: "Navigation",
                      integrationType: "HSP",
                      fileName: (values.fileName).trim() || pageModel.appConfig.download.fileName,
                      fse: handle
                    });
                  })
              } else {
                message.warning("文件目录不存在或未授权，请点击「目录名称」重新选择")
              }
            })
          }}>同步模块</button>}
      </div>
    </div>
  );
};

export default ExportPanel;
