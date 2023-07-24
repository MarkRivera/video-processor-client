import { convertStatusToString, useUpload } from "../hooks/useUpload";

export function Table() {
  const { queueStore } = useUpload();

  return (
    <div class="h-[480px] overflow-auto mb-4">
      <table class="w-full">
        <thead class="uppercase bg-slate-900 border-none">
          <tr class="h-8">
            <th class="text-center px-6 py-3">Part</th>
            <th class="text-center px-6 py-3">Status</th>
            <th class="text-center px-6 py-3">Retries</th>
          </tr>
        </thead>
        <tbody class="mt-8">
          {queueStore.queue.map((item, idx) => {
            return (
              <tr class={idx % 2 === 0 ? "bg-inherit text-center" : "bg-slate-900 text-center"}>
                <td class="py-3">{item.chunkNumber}</td>
                <td class="py-3">{convertStatusToString(item.status)}</td>
                <td class="py-3">{item.retries}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}