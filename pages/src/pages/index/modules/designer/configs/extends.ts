export default {
  title: '模块',
  cards: [
    {
      id: 'module-configs',
      title: '配置',
      type: 'config'
    },
    {
      id: 'module-api',
      title: 'API',
      type: 'api',
      multiple: true,
      inputs: [
        {
          id: 'open',
          title: '调用',
          schema: {
            type: 'string',
            description: '参数'
          }
        }
      ],
      outputsEditable: true,
    },
  ]
  // cards: [
  //   {
  //     id: 'openRouter',
  //     title: '业务模块',
  //     required: true,
  //     inputs: [
  //       {
  //         id: 'open',
  //         title: '打开页面',
  //         schema: {
  //           type: 'unknown',
  //         }
  //       }
  //     ],
  //     outputsEditable: true,
  //   },
  // ],
};
