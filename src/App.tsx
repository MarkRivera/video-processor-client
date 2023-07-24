import { Component } from 'solid-js';
import { useUpload } from './hooks/useUpload';
import { UploadForm } from './components/UploadForm';
import { Queue } from './components/Queue';

const App: Component = () => {
  const { handleFileChange, handleSubmit, queueStore, fileDetails } = useUpload();

  return (
    <main class="text-slate-50 h-screen w-full max-w-7xl mx-auto pt-24 flex flex-col items-center">
      <UploadForm handleFileChange={handleFileChange} handleSubmit={handleSubmit} />
      {queueStore.queue.length > 0 && <Queue queueStore={queueStore} fileDetails={fileDetails} />}
    </main>
  );
};



export default App;
