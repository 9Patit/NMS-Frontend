import React, { useState, useRef } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import axios from 'axios';


registerPlugin(
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview
);

const App = () => {
    const [files, setFiles] = useState([]); 
    const pond = useRef(null); 
    const apiUrl = import.meta.env.PUBLIC_API_KEY;
    
    const handleInit = () => {
        console.log('FilePond instance has initialised', pond.current);
    };

    const handleUpdateFiles = (fileItems) => {
        setFiles(fileItems.map((fileItem) => fileItem.file));
    };

    const handleProcessFile = async (fieldName, file, metadata, load, error, progress, abort) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(
                `${apiUrl}/upload`,  
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (e) => {
                        progress(e.lengthComputable, e.loaded, e.total);
                    }
                }
            );

            load(response.data.result.id);
            console.log(response.data.result.id);
            
        } catch (uploadError) {
            console.error('File upload error:', uploadError);
            error('Failed to upload file');
        }
    };

    const handleRemoveFile = async (source, load, error) => {
        console.log('Source:', source);
        try {
            await axios.delete(`${apiUrl}/delete/${source}`);
            load();
        } catch (deleteError) {
            console.error('File delete error:', deleteError);
            error('Failed to delete file');
        }
    };

    return (
        <div className="App">
            <FilePond
                ref={pond}
                files={files}
                allowMultiple={true}
                maxFiles={3}
                allowRemove={true}
                imagePreviewHeight={170}
                acceptedFileTypes={['image/*']}
                server={{
                    process: handleProcessFile,
                    revert: handleRemoveFile, 
                }}
                oninit={() => handleInit()}
                onupdatefiles={handleUpdateFiles}
            />
        </div>
    );
};

export default App;