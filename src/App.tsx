import { Component } from 'solid-js';
import { createStore, unwrap } from 'solid-js/store';
import axios from 'axios';

const url = 'http://localhost:3000/api/v1/videos/upload';

interface Store {
  file: Blob | null;
  name?: string;
  currentChunk: number;
  chunkSize: number;
  finalFileName?: string;
  queue: Blob[];
  base64Queue: string[];
  totalChunks: number;
}

const [state, setState] = createStore<Store>({
  file: null,
  currentChunk: 0,
  chunkSize: 5_242_880, // 5MB
  queue: [],
  base64Queue: [],
  totalChunks: 0,
});

function readAndUploadChunks() {
  const reader = new FileReader();
  if (!state.file) return;

  const queue = unwrap(state.queue)
  const chunk = queue.shift();
  setState("queue", queue);

  const file = state.file;
  const currentChunk = state.currentChunk;
  setState("currentChunk", state.currentChunk + 1)

  if (!chunk) return;

  const isLastChunk = currentChunk === Math.ceil(file.size / state.chunkSize);

  if (isLastChunk) {
    console.log("All chunks uploaded!");
    return;
  }

  reader.onload = (e) => {
    uploadChunk(e, currentChunk);
  }

  reader.readAsDataURL(chunk);
}


function uploadChunk(readerEvent: ProgressEvent<FileReader>, currentChunk: number) {
  const file = state.file;
  const data = readerEvent.target!.result;
  const params = new URLSearchParams();
  params.set("name", state.name!);
  params.set("size", file!.size.toString());
  params.set("type", file!.type);
  params.set("currentChunk", currentChunk.toString());
  params.set("totalChunks", state.totalChunks.toString());
  console.log({ currentChunk: currentChunk });

  const headers = { "Content-Type": "application/octet-stream" };
  axios.post(url + `?${params.toString()}`, data, { headers })
    .then(res => {
      const isLastChunk = currentChunk === Math.ceil(file!.size / state.chunkSize) - 1;
      console.log({ isLastChunk })
      if (isLastChunk) {
        setState("finalFileName", res.data.finalFileName);
      } else {
        readAndUploadChunks();
      }
    })
}
async function blobIntoDataUrl(queue: Blob[]) {
  const dataUrls: string[] = [];
  for (const chunk of queue) {
    const reader = new FileReader();
    reader.readAsDataURL(chunk);
    const data = await new Promise((resolve) => {
      reader.onload = (e) => {
        resolve(e.target!.result);
      }
    });

    dataUrls.push(data as string);
  }
  return dataUrls;
}

async function* upload(queue: string[]) {
  if (queue.length === 0) return;

  for (const chunk of queue) {
    const params = new URLSearchParams();
    params.set("name", state.name!);
    params.set("size", state.file!.size.toString());
    params.set("chunkSize", chunk.length.toString());
    params.set("type", state.file!.type);
    params.set("currentChunk", state.currentChunk.toString());
    params.set("totalChunks", state.totalChunks.toString());

    const headers = { "Content-Type": "application/octet-stream" };
    const response = await axios.post(url + `?${params.toString()}`, chunk, { headers });

    yield response;
  }

  return "Done Uploading"
}

const App: Component = () => {
  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (state.file === null) return;

    // Reset queue
    console.log(state)


    // When first upload is complete, start the next one until queue is empty
    const requests = upload(state.base64Queue);
    for await (const response of requests) {
      console.log(response);
      setState("currentChunk", state.currentChunk + 1);
    }

    // Clear file related state
    setState(() => {
      return {
        file: null,
        name: undefined,
        queue: [],
        base64Queue: [],
        totalChunks: 0,
        currentChunk: 0,
      }
    })

    // Remove file from input
    const input = document.getElementById("file-input") as HTMLInputElement;
    input.value = "";

    console.log(state)
  }

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    const queue: Blob[] = [];

    if (file instanceof Blob) {
      setState((state) => {
        return {
          ...state,
          file: file,
          name: file.name,
          queue,
          totalChunks: Math.ceil(file.size / state.chunkSize),
        }
      })

      let idx = 0
      while (idx < state.totalChunks) {
        const from = idx * state.chunkSize;
        const to = from + state.chunkSize;

        console.log({ from, to })
        const chunk = file.slice(from, to);
        queue.push(chunk);
        idx++;
      }

      const dataUrls = await blobIntoDataUrl(queue);
      setState("base64Queue", dataUrls);
      console.log(state.base64Queue)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label for="file-input">Select a file:</label>
      <input type="file" id="file-input" onChange={handleFileChange} />
      <button type="submit">Upload</button>
    </form>
  );
};

export default App;
