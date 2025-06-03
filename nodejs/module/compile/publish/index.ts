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
  await API.File.publish({
    userId,
    fileId,
    extName: "harmony-module",
    content: JSON.stringify(publishModule),
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

  const { modules, scenes } = toJson as ToJSON;

  return {
    id: fileId,
    title: fileName,
    sectionAry: Object.entries(modules).map(([_, module]) => {
      return {
        id: module.id,
        title: module.title,
        editors: module.json.inputs.filter((input) => input.type === "config"),
        runtime: {
          ...module.json,
          from: fileId
        }
      }
    }),
    sceneAry: scenes.filter((scene) => {
      return scene.type !== "module"
    })
  }
}

export default publish
