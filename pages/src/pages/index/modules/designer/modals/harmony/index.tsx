import React, { useLayoutEffect } from "react";
import { Button, Form, Input } from "antd";
import { globalModal } from "@/components";
import { pageModel } from "@/stores";

import styles from "./index.less";

const HarmonyRequireForm = ({ onCancel, onOk }) => {
  const [form] = Form.useForm();

  useLayoutEffect(() => {
    form.setFieldsValue({
      fileName: pageModel.appConfig.download.fileName || "module",
    })
  }, [])

  return (
    <div className={styles.require}>
      <div className={styles.help}>
        <div className={styles.title}>使用需知</div>
        <div className={styles.listItem}>1.模块打开基于<a href="https://developer.huawei.com/consumer/cn/doc/best-practices/bpta-hmrouter" target="_blank">HMRouter</a>实现</div>
        <div className={styles.listItem}>2.需手动安装依赖<a href="https://ohpm.openharmony.cn/#/cn/detail/@ohos%2Faxios" target="_blank">@ohos/axios</a>、<a href="https://ohpm.openharmony.cn/#/cn/detail/dayjs" target="_blank">dayjs</a></div>
      </div>
      <Form form={form} layout="vertical">
        <Form.Item
          name="fileName"
          label="文件名"
        >
          <Input placeholder="请输入模块文件名称，默认为module" />
        </Form.Item>
      </Form>

      <div className={styles.footer}>
        <Button onClick={onCancel}>取消</Button>
        <Button
          type="primary"
          onClick={() => {
            form
              .validateFields()
              .then((values) => {
                onOk?.(values);
                globalModal.hide();
              })
              .catch((res) => {});
          }}
        >
          确认
        </Button>
      </div>
    </div>
  );
};

export const showHarmonyRequireModal = ({ onSubmit }) => {
  globalModal.show({
    title: "导出模块源码",
    footer: null,
    width: 480,
    children: (
      <div className="fangzhou-theme">
        <HarmonyRequireForm onCancel={() => globalModal.hide()} onOk={onSubmit} />
      </div>
    ),
  });
};
