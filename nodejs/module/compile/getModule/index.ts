import API from "@mybricks/sdk-for-app/api";
import { runtime, editors } from './template';

const getModule = async (params) => {
  const { moduleId, version, origin } = params;
  const harmonyModule = await API.Material.getMaterialContent({
    namespace: `mybricks.harmony.module.${moduleId}`,
    version
  })
  const { publishId } = harmonyModule.content
  const publishContent = await API.File.getPublishContent({ pubId: publishId });
  // [TODO]
  const module = publishContent.content;
  let comArayCode = "";
  const scenesMap = module.scenes.reduce((pre, cur) => {
    pre[cur.id] = cur;

    if (cur.type === "module") {
      const mainScene = cur;
      const { pinRels } = mainScene;
      const relsOutputsMap: { [key: string]: boolean } = {};
      const inputsRelOutputsMap: { [key: string]: string[] } = {};
      const noRelsOutputs: Array<{
        id: string;
        title: string;
        schema: any;
      }> = [];
      const config: { [key: string]: unknown } = {};
      const configs: {
        id: string;
        title: string;
        type: string;
        defaultValue?: string;
        description?: string;
      }[] = [];
      const inputs = mainScene.inputs
      .filter((input) => {
        const { id, type, title, editor, extValues } = input;
        if (type === "normal") {
          const outputIds = pinRels[`_rootFrame_-${id}`];
          inputsRelOutputsMap[id] = outputIds;
          if (outputIds) {
            outputIds.forEach((id) => {
              relsOutputsMap[id] = true;
            });
          }
          return true;
        } else if (type === "config" && editor?.type) {
          config[id] = extValues?.config?.defaultValue;
          configs.push({
            id,
            title: title,
            type: editor.type,
            defaultValue: extValues?.config?.defaultValue,
            description: extValues?.config?.description,
          });
        }
  
        return false;
      })
      .map(({ id, title, schema }) => {
        return {
          id,
          title,
          schema,
          rels: pinRels[`_rootFrame_-${id}`],
        };
      });
    
      const outputs = mainScene.outputs.map(({ id, title, schema }) => {
        if (!relsOutputsMap[id]) {
          noRelsOutputs.push({ id, title, schema });
        }
    
        return {
          id,
          title,
          schema,
        };
      });

      const slotStyle = mainScene.slot.style;

      let replaceWidth;
      if (slotStyle.widthAuto) {
        replaceWidth = `"fit-content"`;
      } else if (slotStyle.widthFull) {
        replaceWidth = `"100%"`;
      } else {
        replaceWidth = slotStyle.width;
      }
      let replaceHeight;
      if (slotStyle.heightAuto) {
        replaceHeight = `"auto"`;
      } else if (slotStyle.heightFull) {
        replaceHeight = `"100%"`;
      } else {
        replaceHeight = slotStyle.height;
      }
      Reflect.deleteProperty(slotStyle, "width");
      Reflect.deleteProperty(slotStyle, "height");
      Reflect.deleteProperty(slotStyle, "widthAuto");
      Reflect.deleteProperty(slotStyle, "heightAuto");
      slotStyle.widthFull = true;
      slotStyle.heightFull = true;

      // [TODO] version
      comArayCode += `{
        namespace: "mybricks.harmony.module.${module.id}.${cur.id}",
        version: "0.0.1",
        title: "${mainScene.title}",
        description: "${mainScene.title}",
        data: ${JSON.stringify({ config })},
        inputs: ${JSON.stringify(inputs)},
        outputs: ${JSON.stringify(outputs)},
        editors: (${editors
          .replace('"--replace-init-width--"', replaceWidth)
          .replace('"--replace-init-height--"', replaceHeight)
          .replace('"--replace-title--"', `"${mainScene.title}"`)
          .replace('"--replace-configs--"', JSON.stringify(configs))
          .replace(
            '"--replace-events-visible--"',
            noRelsOutputs.length ? " true" : " false" // 前面补一个空格，防止和 return 贴上
          )
          .replace('"--replace-events--"', JSON.stringify(noRelsOutputs))
          .replace('"--replace-id--"', module.id)
          .replace('"--origin--"', `"${origin}"`)})(),
        runtime: ${runtime
          .replace('"--replace-tojson--"', JSON.stringify(mainScene))
          .replace('"--replace-moduleId--"', module.id)
          .replace('--replace-moduleVersion--', version)
          .replace('"--replace-inputsRelOutputsMap--"', JSON.stringify(inputsRelOutputsMap))}
      },`
    }

    return pre;
  }, {})

  const callback = [
    {
      id: 'onLoginFinished',
      title: "注册完成",
      schema: {
        type: "object",
        properties: {
          userId: {type: "string", title: "用户ID"},
          userName: {type: "string", title: "用户名"}
        }
      }
    },
  ]

  return {
    code: `(() => {
  window.module_${module.id} = {
    id: ${module.id},
    comAray: [],
    title: "${module.title}",
    version: "${version}",
    comAray: [${comArayCode}],
    callback: ${JSON.stringify(callback)}
  }
})()`
  }
}

export default getModule;
