import React, { useState } from 'react';
import { FaPaperclip, FaTimes } from 'react-icons/fa';
import './App.css';

const Expense = () => {
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
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
        <input className="description-input" type="text" placeholder="Enter description..." />
        <button className="submit-button">Submit</button>
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
