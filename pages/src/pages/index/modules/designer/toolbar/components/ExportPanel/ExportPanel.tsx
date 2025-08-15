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
    router: "Navigation" | "HMRouter"
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

const HarmonyRequireForm = ({ onCancel, onOk, getPopupContainer }) => {
  const [form] = Form.useForm();

  useLayoutEffect(() => {
    form.setFieldsValue({
      fileName: pageModel.appConfig.download.fileName,
      source: pageModel.appConfig.download.source || "ohpmLibrary",
      router: pageModel.appConfig.download.router || "Navigation",
      enableAI: false,
    })
  }, [])

  return (
    <div className={`${css.require} fangzhou-theme`}>
      <Form form={form} layout="vertical" size="small">
        <Form.Item
          name="fileName"
          label="模块名称"
        >
          <Input placeholder="请输入模块名称" />
        </Form.Item>
        <Form.Item
          name="source"
          label="模块依赖"
        >
          <Select
            placeholder="请选择模块依赖"
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
        <Form.Item
          name="router"
          label="模块路由"
        >
          <Select
            placeholder="请选择模块路由"
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
          name="enableAI"
          label="AI「Beta」"
          tooltip="通过AI对代码进行优化，提高可读性。"
        >
          <Switch />
        </Form.Item>
      </Form>

      <div className={css.help}>
        <div className={css.tips}>使用步骤及注意事项</div>
        <div className={css.listItem}>1.导出当前模块；</div>
        <div className={css.listItem}>2.解压并拷贝至应用工程的ets目录下；</div>
        <div className={css.listItem}>3.阅读模块内的README.md文件，了解如何使用；</div>
      </div>

      <div className={css.footer}>
        <button className={css.button} onClick={onCancel}>取消</button>
        <button className={`${css.button} ${css.mainButton}`} onClick={() => {
          form
            .validateFields()
            .then((values) => {
              onOk?.({
                ...values,
                fileName: (values.fileName).trim() || pageModel.appConfig.download.fileName,
              });
            })
        }}>确认</button>
      </div>
    </div>
  );
};

export default ExportPanel;
