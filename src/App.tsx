import { Component } from 'solid-js';
import { v4 as uuidv4 } from 'uuid';
import { createStore } from 'solid-js/store';

const url = 'http://localhost:3000/api/v1/videos/upload';

interface Store {
  file: Blob | null;
}

const [state, setState] = createStore<Store>({
  file: null,
});


const App: Component = () => {
  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const form = {
      file: state.file,
      chunkIndex: 0,
      totalChunks: 1,
      uuid: uuidv4()
    }

    if (state.file instanceof Blob) {
      const formData = new FormData();
      formData.append('file', state.file);
      formData.append('chunkIndex', form.chunkIndex.toString());
      formData.append('totalChunks', form.totalChunks.toString());
      formData.append('uuid', form.uuid);

      fetch(url, {
        method: 'POST',
        body: formData
      })
    }
  };

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file instanceof Blob) {
      setState('file', file);
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
