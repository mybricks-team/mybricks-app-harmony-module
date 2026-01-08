import { aiUtils } from './get-ai-encrypt-data';

const logger = {
  info(message: string) {
    console.log(
      '%c%s%c %s',
      'background-color: #fa6400; color: #ffffff;padding: 0px 6px',
      'AI-SDK',
      'color: #ffffff',
      message
    )
  }
}

enum FetchTarget {
  CustomApp = 'CustomApp',
  Platform = 'Platform',
  Center = 'Center'
}

let fetchTaget: FetchTarget

async function checkFetchTarget(): Promise<FetchTarget> {
  if (fetchTaget) {
    return Promise.resolve(fetchTaget)
  }

  /** 如果安装了自定义的AI服务，请求自定义服务 */
  const hasAICustomApp = await fetch('/api/ai-service/check-config')
    .then((res) => {
      return res.json()
    })
    .then((data: any) => {
      if (data?.code === 1) {
        return true
      } else {
        return false
      }
    })
    .catch((e: any) => {
      return false
    })

  if (hasAICustomApp) {
    logger.info('使用自定义服务')
    return fetchTaget = FetchTarget.CustomApp
  }

  /** 如果配置了平台token，请求平台服务 */
  const hasPlatformToken = await fetch('/api/assistant/status')
    .then((res) => {
      return res.json()
    })
    .then((data: any) => {
      if (data?.code === 1) {
        return true
      } else {
        return false
      }
    })
    .catch((e: any) => {
      return false
    })

  if (hasPlatformToken) {
    logger.info('使用平台服务')
    return fetchTaget = FetchTarget.Platform
  }

  logger.info('使用AI服务')
  return fetchTaget = FetchTarget.Center
}

export const getAIResponse = async ({ model, messages, role, tools }, options?) => {
  await checkFetchTarget()
  let streamUrl = '//ai.mybricks.world/stream-with-tools'
  if (fetchTaget === FetchTarget.CustomApp) {
    streamUrl = '/api/ai-service/stream'
  } else if (fetchTaget === FetchTarget.Platform) {
    streamUrl = '/api/assistant/stream'
  }

  const cancelControl = !!AbortController ? new AbortController() : null;

  const abort = () => cancelControl?.abort?.();

  const { onMessage, onComplete, devMode = false, devUrl = '//ai.mybricks.world/stream-test' } = options ?? {};

  const response = await fetch(devMode ? devUrl : streamUrl, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      ...(role ? {
        "M-Request-Role": role,
      } : {})
    },
    signal: cancelControl?.signal,
    body: JSON.stringify(devMode ? {
      model,
      messages,
      // response_format: {
      //   type: 'json_schema',
      //   json_schema: {
      //     name: 'response',
      //     strict: true,
      //     description: '智能响应，根据用户意图返回计划或对话',
      //     schema: {
      //       type: 'object',
      //       properties: {
      //         type: {
      //           type: 'string',
      //           enum: ['plan', 'dialogue'],
      //           description: '响应类型：plan表示规划模式，dialogue表示对话模式'
      //         },
      //         data: {
      //           description: '响应数据，根据type字段的值决定具体结构',
      //           oneOf: [
      //             {
      //               description: '当type为plan时的数据结构：工具调用列表',
      //               type: 'array',
      //               items: {
      //                 type: 'object',
      //                 description: '单个工具调用对象',
      //                 properties: {
      //                   name: {
      //                     type: 'string',
      //                     description: '工具名称'
      //                   },
      //                   params: {
      //                     type: 'object',
      //                     description: '工具参数对象，包含调用该工具所需的所有参数',
      //                     additionalProperties: true
      //                   }
      //                 },
      //                 required: ['name', 'params'],
      //                 additionalProperties: false
      //               }
      //             },
      //             {
      //               description: '当type为dialogue时的数据结构',
      //               type: 'object',
      //               properties: {
      //                 content: {
      //                   type: 'string',
      //                   description: '直接回答的内容'
      //                 },
      //                 reason: {
      //                   type: 'string',
      //                   description: '直接回答而不是执行工具的原因'
      //                 },
      //                 suggestions: {
      //                   type: 'array',
      //                   description: '给用户的建议列表',
      //                   items: {
      //                     type: 'string',
      //                     description: '单条建议内容'
      //                   }
      //                 }
      //               },
      //               required: ['content', 'reason', 'suggestions'],
      //               additionalProperties: false
      //             }
      //           ]
      //         }
      //       },
      //       required: ['type', 'data'],
      //       additionalProperties: false
      //     }
      //   }
      // }
    } : aiUtils.getAiEncryptData({
      model,
      messages,
      role,
    })),
    credentials: 'include'
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let responseString = ''

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });
    onMessage?.(chunk)
    responseString += chunk
  }

  onComplete?.(responseString)

  return {
    abort
  }
}

export const getAvailable = async () => {
  await checkFetchTarget()

  if (fetchTaget === FetchTarget.CustomApp) {
    return null
  } else if (fetchTaget === FetchTarget.Platform) {
    return null
  }

  const res = await fetch('//ai.mybricks.world/api/rate-limit/mine', {
    credentials: 'include'
  }).then((res) => {
    return res.json()
  })

  if (res?.roles?.common?.total) {
    return {
      times: res.roles.common.remaining
    }
  }
}