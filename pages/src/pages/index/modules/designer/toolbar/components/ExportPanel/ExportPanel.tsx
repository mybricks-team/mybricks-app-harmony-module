import React, { useEffect, useState, useLayoutEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Form, Input, Select, Switch } from "antd";
import { pageModel } from "@/stores";
import css from "./ExportPanel.less";

interface ExportPanelProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: { 
    fileName: string;
    source: "ohpmLibrary" | "sourceCode";
    router: "Navigation" | "HMRouter";
    integrationType: "HSP" | "sourceCode";
  }) => void;
}
const ExportPanel = (props: ExportPanelProps) => {
  const ref = useRef<HTMLDivElement>();
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
        导出下载模块的源代码
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
const HarmonyRequireForm = ({ onCancel, onOk, getPopupContainer }) => {
  const [form] = Form.useForm();
  const [fileNameError, setFileNameError] = useState(null);

  useLayoutEffect(() => {
    form.setFieldsValue({
      fileName: pageModel.appConfig.download.fileName,
      source: pageModel.appConfig.download.source || "ohpmLibrary",
      router: pageModel.appConfig.download.router || "Navigation",
      integrationType: pageModel.appConfig.download.integrationType || "HSP",
      enableAI: false,
    })
  }, [])

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
      </Form>

      <div className={css.help}>
        <div className={css.tips}>使用步骤及注意事项</div>
        <div className={css.listItem}>1.导出当前模块的源代码；</div>
        <div className={css.listItem}>2.解压并拷贝至应用工程的ets目录下；</div>
        <div className={css.listItem}>3.阅读模块内的README.md文件，了解如何使用；</div>
      </div>

      <div className={css.footer}>
        <button className={css.button} onClick={onCancel}>取消</button>
        <button disabled={fileNameError} className={`${css.button} ${css.mainButton}`} onClick={() => {
          form
            .validateFields()
            .then((values) => {
              onOk?.({
                ...values,
                router: "Navigation",
                integrationType: "HSP",
                fileName: (values.fileName).trim() || pageModel.appConfig.download.fileName,
              });
            })
        }}>确认</button>
      </div>
    </div>
  );
};

export default ExportPanel;
