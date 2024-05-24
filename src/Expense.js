import React, { useState } from 'react';
import { FaPaperclip, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './App.css';

const Expense = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);

  const handleImageUpload = (event) => {
    checkServer();
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
      sendFileToServer(file);
    }
  };

  // const sendFileToServer = async (file) => {
  //   const formData = new FormData();
  //   formData.append('image', file);

  //   try {
  //     const response = await axios.post('/image', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error('There was an error uploading the image!', error);
  //   }
  // };

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
        setResult(prevResult => response.data);
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

  const sendTextToServer = async () => {
    try {
      console.log(inputText);
      const response = await axios.post('/text', { text: inputText });
      setResult(prevResult => response.data);
      console.log(response.data);
      setInputText("");
    } catch (error) {
      console.error('Error sending text to server:', error);
    }
  };

  const checkServer = async () => {
    try {
      const response = await axios.get('/check');
      console.log(response.data);
    } catch (error) {
      console.error('Error with server:', error);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    document.getElementById('file-input').value = '';
  };

  return (
    <div className='component'>
      <div className="text">
        SORT and SAVE,<br></br>
        your Money, your Way
      </div>
      <div className="description">
        Effortlessly navigate your finances!<br></br>
        Categorize expenses, chart your budget, and thrive financially with ease
      </div>

      <div className="form-container">
        <div className="input-container">
          <div className="icon">
            <label htmlFor="file-input">
              <FaPaperclip size={20} />
            </label>
            <input id="file-input" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </div>
          <input className="description-input" type="text" placeholder="Enter description..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
          <button className="submit-button" onClick={sendTextToServer}>Submit</button>
        </div>
        {uploadedImage && (
          <div className="image-container">
            <img className="uploaded-image" src={uploadedImage} alt="Uploaded" />
            <button className="close-button" onClick={handleRemoveImage}><FaTimes size={20} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expense;
