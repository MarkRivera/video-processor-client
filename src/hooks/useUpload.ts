import axios from "axios";
import { createStore, produce } from "solid-js/store";

export interface FileDetails {
  file: Blob | null;
  name: string | null;
}

export type QueueItem = {
  base64: string;
  chunkNumber: number;
  retries: number;
  status: ChunkStatus;
}

export interface QueueStore {
  queue: QueueItem[];
  totalChunks: number;
  currentChunk: number;
  chunkSize: number;
  percentUploaded: number;
  uploadStatus: UploadStatus;
}

export enum ChunkStatus {
  PENDING = "PENDING",
  UPLOADING = "UPLOADING",
  RETRYING = "RETRYING",
  FAILED = "FAILED",
  SUCCESS = "SUCCESS",
}

export enum UploadStatus {
  PENDING = "PENDING",
  UPLOADING = "UPLOADING",
  RETRYING = "RETRYING",
  FAILED = "FAILED",
  SUCCESS = "SUCCESS",
}

const [fileDetails, setFileDetails] = createStore<FileDetails>({
  file: null,
  name: "",
});

const [queueStore, setQueueStore] = createStore<QueueStore>({
  queue: [],
  totalChunks: 0,
  currentChunk: 0,
  chunkSize: 5_242_880, // 5MB
  percentUploaded: 0,
  uploadStatus: UploadStatus.PENDING,
});

export function useUpload() {
  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (isNotNullOrUndefined(fileDetails)) {
      // Reset queue

      // When first upload is complete, start the next one until queue is empty
      if (!isNotNullOrUndefined(fileDetails.file) || !isNotNullOrUndefined(fileDetails.name)) return;
      const requests = upload(fileDetails.file, fileDetails.name, queueStore); // TODO: Handle error

      for await (const response of requests) {
        // console.log(response); // TODO: Handle response
        setQueueStore("currentChunk", queueStore.currentChunk + 1);
      }

      // Remove file from input
      const input = document.getElementById("file-input") as HTMLInputElement;
      input.value = "";
    }
  }


  async function handleFileChange(e: Event) {
    // Clear State if file is changed
    clearState();

    const target = e.target as HTMLInputElement;
    const fileList = target.files;

    if (isNotNullOrUndefined(fileList)) {
      const file = fileList[0];

      setFileDetails({
        file: file,
        name: file.name,
      });

      setQueueStore({
        totalChunks: Math.ceil(file.size / queueStore.chunkSize),
        currentChunk: 0, // Start at 0
      })

      enqueue(file, queueStore); // Create Chunks, Convert to Base64 and push to Queue
    }
  }

  return {
    fileDetails,
    queueStore,
    handleFileChange,
    handleSubmit
  }
}

export function clearState() {
  setFileDetails({
    file: null,
    name: null,
  });

  setQueueStore({
    queue: [],
    totalChunks: 0,
    currentChunk: 0,
    chunkSize: 5_242_880, // 5MB
    percentUploaded: 0,
    uploadStatus: UploadStatus.PENDING,
  })
}

export async function enqueue(file: Blob, queueStore: QueueStore) {
  let idx = 0
  while (idx < queueStore.totalChunks) {
    const from = idx * queueStore.chunkSize;
    const to = from + queueStore.chunkSize;

    const chunk = file.slice(from, to);
    const base64 = await blobIntoBase64(chunk);

    const data = {
      base64,
      chunkNumber: idx,
      retries: 0,
      status: ChunkStatus.PENDING,
    }

    setQueueStore(
      produce(state => {
        state.queue.push(data);
      })
    )

    idx++;
  }

}

async function* upload(file: Blob, name: string, uploadQueue: QueueStore) {
  const url = 'http://localhost:3000/api/v1/videos/upload';
  if (uploadQueue.queue.length === 0) return;

  for (const queueItem of uploadQueue.queue) {
    const options = { // Last Chunk is the only one that changes, all others are the same, we are creating the same object over and over again
      name,
      size: file.size.toString(),
      chunkSize: queueItem.base64.length.toString(),
      type: file.type,
      currentChunk: uploadQueue.currentChunk.toString(),
      totalChunks: uploadQueue.totalChunks.toString(),
      isLastChunk: (uploadQueue.currentChunk === uploadQueue.totalChunks - 1).toString(),
    }

    const params = createParams(options);

    try {
      yield callWithRetry(url, params, queueItem)
      // If all chunks are uploaded, set upload status to success
      if (uploadQueue.currentChunk === uploadQueue.totalChunks - 1 && queueItem.status === ChunkStatus.SUCCESS) {
        setQueueStore(
          produce(state => {
            state.uploadStatus = UploadStatus.SUCCESS;
            state.percentUploaded = setPercentage(state.currentChunk + 1, state.totalChunks);
          })
        )
      }
    } catch (error) {
      console.log({ error })
      console.log({ queueStore })
      return "An error occured"
    }
  }

  return "Done Uploading"
}

async function callWithRetry(url: string, params: URLSearchParams, queueItem: QueueItem, depth = 0): Promise<any> {
  try {
    setQueueStore(
      produce(state => {
        state.queue[queueItem.chunkNumber].status = ChunkStatus.UPLOADING;
      })
    )

    const response = await axios.post(url + `?${params.toString()}`, queueItem.base64, {
      headers: { "Content-Type": "application/octet-stream" }
    });

    setQueueStore(
      produce(state => {
        state.queue[queueItem.chunkNumber].status = ChunkStatus.SUCCESS;
        state.percentUploaded = getPercentage(state.currentChunk + 1, state.totalChunks);
      })
    )

    return response;
  } catch (error) {
    if (depth > 4) {
      setQueueStore(
        produce(state => {
          state.queue[queueItem.chunkNumber].status = ChunkStatus.FAILED;
          state.uploadStatus = UploadStatus.FAILED;
        })
      )

      throw error;
    }

    await wait(2 ** depth * 100)

    setQueueStore(
      produce(state => {
        state.queue[queueItem.chunkNumber].status = ChunkStatus.RETRYING;
        state.queue[queueItem.chunkNumber].retries = state.queue[queueItem.chunkNumber].retries + 1;
        state.uploadStatus = UploadStatus.RETRYING;
      })
    )

    return callWithRetry(url, params, queueItem, depth + 1);
  }
}

export async function blobIntoBase64(chunk: Blob) {
  const reader = new FileReader();
  reader.readAsDataURL(chunk);
  const data = await new Promise<string>((resolve) => {
    reader.onload = (e) => {
      if (!e.target) return;
      if (typeof e.target.result !== "string") return;
      resolve(e.target.result);
    }
  });

  return data;
}

export function createParams(options: { [key: string]: string }): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    params.set(key, value);
  });

  return params;
}

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getPercentage(currentChunk: number, totalChunks: number) {
  return Math.ceil((currentChunk / totalChunks) * 100)
}

export function setPercentage(chunkNumber: number, totalChunks: number) {
  return Math.ceil((chunkNumber / totalChunks) * 100)
}

export function convertStatusToString(status: ChunkStatus) {
  // Upper Case First Letter
  const statusArray = status.toLowerCase().split("");
  statusArray[0] = statusArray[0].toUpperCase();
  const statusString = statusArray.join("");
  return statusString;
}

export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}