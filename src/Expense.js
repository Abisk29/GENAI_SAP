import React, { useState } from 'react';
import { FaPaperclip, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import './App.css';

const Expense = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setUploadedImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (uploadedImageFile) {
      await sendFileToServer(uploadedImageFile);
      setUploadedImageFile(null);
    }
    if (inputText) {
      await sendTextToServer(inputText);
    }
  };

  const sendFileToServer = async (file, maxRetries = 3, backoffFactor = 300) => {
    const formData = new FormData();
    formData.append('image', file);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await axios.post('/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setResult(response.data);
        console.log(response.data);
        return;  // Exit if the request is successful
      } catch (error) {
        if (attempt < maxRetries - 1) {
          const waitTime = backoffFactor * (2 ** attempt);  // Exponential backoff
          console.warn(`Upload failed, retrying in ${waitTime}ms...`, error);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.error('There was an error uploading the image!', error);
          throw error;  // Rethrow the error after the final attempt
        }
      }
    }
  };

  const sendTextToServer = async (text) => {
    try {
      const response = await axios.post('/text', { text });
      setResult(response.data);
    } catch (error) {
      console.error('Error sending text to server:', error);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    document.getElementById('file-input').value = '';
  };

  const downloadCSV = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/download-csv', {
        responseType: 'blob' // Important to get the response as a blob
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', 'data.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  const columns = [
    {
      name: 'Item',
      selector: row => row.item,
      sortable: true,
    },
    {
      name: 'Class',
      selector: row => row.class,
      sortable: true,
    }
  ];

  const data = result?.items?.map((item, index) => ({
    item: item,
    class: result.class[index],
  })) || [];

  return (
    <div className='component'>
      <div className='component'>
        <div className="text-container">
          <div className="text">
            SORT and SAVE,<br />
            your Money, your Way
          </div>
          <div className="description">
            Effortlessly navigate your finances!<br />
            Categorize expenses, chart your budget, and thrive financially with ease
          </div>
        </div>
      </div>

      <div className="form-result-wrapper">
        <div className="form-container">
          <div className="input-container">
            <div className="icon">
              <label htmlFor="file-input">
                <FaPaperclip size={20} />
              </label>
              <input id="file-input" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>
            <input className="description-input" type="text" placeholder="Enter description..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
            <button className="submit-button" onClick={handleSubmit}>Submit</button>
          </div>
          {uploadedImage && (
            <div className="image-container">
              <img className="uploaded-image" src={uploadedImage} alt="Uploaded" />
              <button className="close-button" onClick={handleRemoveImage}><FaTimes size={20} /></button>
            </div>
          )}
        </div>

        {result && (
          <div className="result-container">
            <DataTable
              className="dataTable-container"
              columns={columns}
              data={data}
              pagination
            />
            <button className="download-button" onClick={downloadCSV}>Download CSV</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expense;
