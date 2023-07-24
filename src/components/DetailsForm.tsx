import { FileDetails, isNotNullOrUndefined, useUpload } from "../hooks/useUpload";

export function DetailsForm({ }: { fileDetails: FileDetails }) {
  const { fileDetails } = useUpload();
  return (
    <form class="py-4">
      <label>
        <span class="text-gray-700 ml-2">Title</span>
        <input type="text" class="my-1 px-2 py-4 block w-full rounded-md bg-slate-200 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 text-black" placeholder={isNotNullOrUndefined(fileDetails.name) ? fileDetails.name : ""} />
      </label>
    </form>
  )
}