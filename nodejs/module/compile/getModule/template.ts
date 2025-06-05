/**
 * 手动去在线网站把模板压缩了抛出
 * TS => JS :  https://www.typescriptlang.org/play?#code/Q
 * 压缩 JS :  https://jscompress.com/
 */
const runtime = `function runtimeTemplate({env:t,data:s,inputs:c,outputs:u}){const e=window.React;return e.useMemo(()=>{var e="--replace-tojson--",o="--replace-inputsRelOutputsMap--";let n=!1;const{canvas:i}=t;return t.renderCom(e,{env:Object.assign(Object.assign({},t),{canvas:Object.assign(Object.assign({},i),{open:(e,t,n,s,u={})=>{i.open(e,t,n,s,Object.assign(Object.assign({},u),{moduleId:"--replace-moduleId--",moduleVersion:"--replace-moduleVersion--"}))}})}),ref:function(a){if(!n){n=!0,s.refs=a;var{config:t}=s;let i=0;e.inputs.forEach(({id:u,type:e})=>{"config"===e?u in t&&a.inputs[u](t[u]):c[u]((e,t)=>{var n,s=++i;0<(null===(n=o[u])||void 0===n?void 0:n.length)?(o[u].forEach(e=>{a.outputs(e+"&execute&"+s,t[e])}),a.inputs[u+"&execute&"+s](e)):a.inputs[u](e)})}),e.outputs.forEach(({id:e})=>{var t;0<(null===(t=o[e])||void 0===t?void 0:t.length)||a.outputs(e,u[e])}),a.run()}},disableAutoRun:!0})},[])}`;

const editors = `function editorsTemplate(){return{"@init":function({style:t}){t.width="--replace-init-width--",t.height="--replace-init-height--"},"@resize":{options:["width","height"]},":root":(t,i,e)=>{var n="--origin--";i.title="--replace-title--",i.items=[..."--replace-configs--".map(({id:e,title:t,type:i,defaultValue:n,description:o})=>({title:t,type:i,description:o,value:{get:function({data:t}){return e in t.config?t.config[e]:n},set:function({data:t},i){t.config[e]=i,t.refs&&t.refs.inputs[e](i)}}})),{title:"事件",ifVisible:function(){return"--replace-events-visible--"},items:[..."--replace-events--".map(({id:t,title:i})=>({title:i,type:"_Event",options:()=>({outputId:t})}))]}],n===window.location.origin&&(e.title="高级",e.items=[{title:"打开模块搭建页面",type:"button",ifVisible:function({}){return n===window.location.origin},value:{set:function(){window.open('/mybricks-app-harmony-module/index.html?id="--replace-id--"')}}}])}}}`;

export {
  runtime,
  editors
}

function runtimeTemplate({
  env,
  data,
  inputs: propsInputs,
  outputs: propsOutputs,
}: any) {
  const React = (window as any).React;

  const render = React.useMemo(() => {
    const mainScene: any = "--replace-tojson--";
    const inputsRelOutputsMap: any = "--replace-inputsRelOutputsMap--";
    let flag = false;

    const { canvas } = env;

    return env.renderCom(mainScene, {
      env: {
        ...env,
        canvas: {
          ...canvas,
          open: (sceneId: any, params: any, openType: any, historyType: any, configs: any = {}) => {
            canvas.open(sceneId, params, openType, historyType, {
              ...configs,
              moduleId: "--replace-moduleId--",
              moduleVersion: "--replace-moduleVersion--",
            })
          }
        }
      },
      ref(refs: any) {
        // 多场景会执行多次 ref，但实际只需执行一次
        if (flag) return;
        flag = true;

        data.refs = refs;
        const { config } = data;

        let count = 0;
        mainScene.inputs.forEach(({ id, type }: any) => {
          /** 配置项 */
          if (type === "config") {
            if (id in config) {
              refs.inputs[id](config[id]);
            }
          } else {
            propsInputs[id]((value: any, relOutputs: any) => {
              const curCount = ++count;
              if (inputsRelOutputsMap[id]?.length > 0) {
                inputsRelOutputsMap[id].forEach((outputId: string) => {
                  refs.outputs(outputId + "&execute&" + curCount, relOutputs[outputId]);
                });
                refs.inputs[id + "&execute&" + curCount](value);
              }
              else refs.inputs[id](value);
            });
          }
        });
        mainScene.outputs.forEach(({ id }: any) => {
          if (inputsRelOutputsMap[id]?.length > 0) return;
          refs.outputs(id, propsOutputs[id]);
        });
        refs.run();
      },
      /** 禁止主动触发IO、执行自执行计算组件 */
      disableAutoRun: true
    });
  }, []);

  return render;
}

function editorsTemplate() {
  const editors = {
    '@init'({ style }: any) {
      style.width = "--replace-init-width--";
      style.height = "--replace-init-height--";
    },
    '@resize': {
      options: ['width', 'height']
    },
    ":root": (_: any, cate1: any, cate2: any) => {
      const origin = "--origin--";

      cate1.title = "--replace-title--";
      cate1.items = [
        ...("--replace-configs--" as any).map(
          ({ id, title, type, defaultValue, description }: any) => {
            return {
              title,
              type: type,
              description: description,
              value: {
                get({ data }: any) {
                  if (id in data.config) {
                    return data.config[id];
                  }
                  return defaultValue;
                },
                set({ data }: any, value: any) {
                  data.config[id] = value;
                  // ui组件中为了编辑后看到效果要调refs.inputs，计算组件没有refs
                  if (data.refs){
                    data.refs.inputs[id](value);
                  }      
                },
              },
            };
          }
        ),
        {
          title: "事件",
          ifVisible() {
            return "--replace-events-visible--";
          },
          items: [
            ...("--replace-events--" as any).map(({ id, title }: any) => {
              return {
                title,
                type: "_Event",
                options: () => {
                  return {
                    outputId: id,
                  };
                },
              };
            }),
          ],
        },
      ];

      if (origin === window.location.origin) {
        cate2.title = "高级";
        cate2.items = [
          {
            title: "打开模块搭建页面",
            type: "button",
            ifVisible({ data }: any) {
              return origin === window.location.origin;
            },
            value: {
              set() {
                window.open(
                  '/mybricks-app-harmony-module/index.html?id="--replace-id--"'
                );
              },
            },
          },
        ];
      }
    },
  };

  return editors;
}
