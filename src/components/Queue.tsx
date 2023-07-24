import { FileDetails, QueueStore } from "../hooks/useUpload";
import { DetailsForm } from "./DetailsForm";
import { Divider } from "./Divider";
import { ProgressBar } from "./ProgressBar";
import { Table } from "./Table";

function Header({ fileDetails }: { fileDetails: FileDetails }) {
  return (
    <div class="flex justify-between mb-4 items-center">
      <h2 class="text-2xl font-bold">{fileDetails.name}</h2>
    </div>
  )
}

function Percentage({ queueStore }: { queueStore: QueueStore }) {
  return (
    <div class="flex justify-between items-center h-12 my-4 px-2">
      <div class="text-gray-400">Uploading...</div>
      <div class="text-gray-400">{queueStore.percentUploaded}%</div>
    </div>
  )
}

export function Queue({ queueStore, fileDetails }: { queueStore: QueueStore, fileDetails: FileDetails }) {
  return (
    <section class="w-2/3 mt-8 shadow-xl">
      <Header fileDetails={fileDetails} />
      <Divider />
      <ProgressBar queueStore={queueStore} />
      <DetailsForm fileDetails={fileDetails} />
      <Divider />
      <Table />
      <Divider />
      <Percentage queueStore={queueStore} />
    </section>
  )
}