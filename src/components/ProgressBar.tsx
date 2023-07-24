import { QueueStore } from "../hooks/useUpload";

export function ProgressBar({ queueStore }: { queueStore: QueueStore }) {
  return (
    <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div class="bg-blue-600 h-2.5 rounded-full" style={{ width: `${queueStore.percentUploaded}%` }}></div>
    </div>
  )
}