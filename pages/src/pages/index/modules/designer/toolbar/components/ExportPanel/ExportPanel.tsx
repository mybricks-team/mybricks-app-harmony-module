import React, { useEffect, useState, useLayoutEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Form, Input, Button } from "antd";
import { pageModel } from "@/stores";
import css from "./ExportPanel.less";

interface ExportPanelProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: { fileName: string }) => void;
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
      />
    </div>,
    document.body
  )
}

const HarmonyRequireForm = ({ onCancel, onOk }) => {
  const [form] = Form.useForm();

  useLayoutEffect(() => {
    form.setFieldsValue({
      fileName: pageModel.appConfig.download.fileName,
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
      </Form>

      <div className={css.help}>
        <div className={css.tips}>使用步骤及注意事项</div>
        <div className={css.listItem}>1.导出当前模块；</div>
        <div className={css.listItem}>2.解压并拷贝至应用工程的ets目录下；</div>
        <div className={css.listItem}>3.阅读模块内的README.md文件，了解api的使用；</div>
      </div>

      <div className={css.footer}>
        <Button onClick={onCancel} size="small">取消</Button>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            form
              .validateFields()
              .then((values) => {
                onOk?.({
                  ...values,
                  fileName: values.fileName || pageModel.appConfig.download.fileName,
                });
              })
          }}
        >
          确认
        </Button>
      </div>
    </div>
  );
};

export default ExportPanel;
