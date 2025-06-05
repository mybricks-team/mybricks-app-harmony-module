import API from "@mybricks/sdk-for-app/api";
import * as path from "path";
import * as fse from "fs-extra";

const publish = async (params: any) => {
  const { userId, fileId, data, fileName, projectPath } = params;

  const publishModule = getPublishModule({
    toJson: data.toJson,
    fileId,
    fileName
  })

  await fse.writeJSON(path.join(projectPath, "module.json"), publishModule, "utf-8");

  // @ts-ignore
  const publishResult: any = await API.File.publish({
    userId,
    fileId,
    extName: "harmony-module",
    content: JSON.stringify(publishModule)
  })

  await API.Material.createCommonMaterial({
    userId,
    title: fileName,
    type: "harmony-module",
    namespace: `mybricks.harmony.module.${fileId}`,
    scene: null,
    content: JSON.stringify({ 
      content: {
        publishId: publishResult.pib_id,
        moduleId: fileId
      }
    }),
  })
}

const getPublishModule = (params) => {
  const { toJson, fileId, fileName } = params;
  interface ToJSON {
    modules: Record<string, {
      id: string;
      title: string;
      json: {
        inputs: Array<{ type: "config" }>
      }
    }>
    scenes: Array<{ type: "module" }>
  }

  // mpa模式，模块也体现在scenes中
  const { scenes } = toJson as ToJSON;

  return {
    id: fileId,
    title: fileName,
    // [TODO] 记录版本号
    scenes,
  }
}

export default publish
