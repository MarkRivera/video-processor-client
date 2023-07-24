type UploadFormProps = {
  handleFileChange: (e: Event) => void;
  handleSubmit: (e: SubmitEvent) => void;
}

export function UploadForm({ handleFileChange, handleSubmit }: UploadFormProps) {
  return (
    <form onSubmit={handleSubmit} class='w-2/3' id='form'>
      <div>
        <label
          class="flex justify-center w-full h-32 px-4 transition border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
          <span class="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="font-medium text-gray-600">
              Drop files to Attach, or
              <span class="text-slate-200 underline ml-1">browse</span>
            </span>
          </span>
          <input type="file" id="file-input" onChange={handleFileChange} class="hidden" accept='.mp4' />
        </label>
      </div>
      <div class="">
        <button type="submit" class="w-full h-12 mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md">
          Upload
        </button>
      </div>
    </form>
  )
}