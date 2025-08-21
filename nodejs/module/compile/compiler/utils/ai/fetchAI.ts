import axios from "axios";

interface FetchAIParams {
  data: any;
  url: string;
}
const fetchAI = async (params: FetchAIParams) => {
  const response = await axios.post(
    params.url,
    params.data,
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
      chunk += decoded;
    });

    response.data.on("end", () => {
      resolve(chunk);
    });

    response.data.on("error", (err: Error) => {
      reject(err);
    });
  });
}

export default fetchAI;
