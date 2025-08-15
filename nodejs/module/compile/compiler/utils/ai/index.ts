import * as path from "path";
import * as fse from "fs-extra";
import axios from "axios";

const refactorCodeSystem = fse.readFileSync(path.join(__dirname, "./refactorCodeSystem.md"), 'utf-8');

// google/gemini-2.5-pro

/**
 * google/gemini-2.5-flash
 * 正常运行，速度快，变量转换不是很理想，再调整下
 */
// const refactorCodeByAi = async (code: string, model = "google/gemini-2.5-flash") => {
//   const cancelControl = !!AbortController ? new AbortController() : null;
//   const _messages = [
//     {
//       role: "system",
//       content: refactorCodeSystem
//     },
//     {
//       role: "user",
//       content: `\`\`\`arkts
//       ${code}
//       \`\`\``
//     }
//   ]

//   const response = await fetch(
//     "https://ai.mybricks.world/stream-test",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       signal: cancelControl?.signal,
//       credentials: 'include',
//       body: JSON.stringify({
//         model,
//         messages: _messages,
//       }),
//     }
//   );

//   const reader = response.body.getReader();
//   const decoder = new TextDecoder();
//   let chunk = "";

//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) {
//       break;
//     }

//     console.log("[chunk]", decoder.decode(value, { stream: true }))

//     chunk += decoder.decode(value, { stream: true });
//   }

//   const arkts = chunk.match(/```arkts\s*([\s\S]*?)\s*```/)?.[1];

//   return arkts;
// }

const refactorCodeByAi = async (code: string, model = "google/gemini-2.5-flash") => {
  const _messages = [
    {
      role: "system",
      content: refactorCodeSystem
    },
    {
      role: "user",
      content: `\`\`\`arkts
      ${code}
      \`\`\``
    }
  ];

  const response = await axios.post(
    "https://ai.mybricks.world/stream-test",
    {
      model,
      messages: _messages,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      responseType: "stream"
    }
  );

  const decoder = new TextDecoder();
  let chunk = "";

  return new Promise<string | undefined>((resolve, reject) => {
    response.data.on("data", (data: Buffer) => {
      const decoded = decoder.decode(data, { stream: true });
      console.log("[chunk]", decoded);
      chunk += decoded;
    });

    response.data.on("end", () => {
      const arkts = chunk.match(/```arkts\s*([\s\S]*?)\s*```/)?.[1];
      resolve(arkts);
    });

    response.data.on("error", (err: Error) => {
      reject(err);
    });
  });
}



export {
  refactorCodeByAi
}
