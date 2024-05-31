import React, { useState } from "react";
import { FaPaperclip, FaTimes } from "react-icons/fa";
import axios from "axios";
import DataTable from "react-data-table-component";
import "./Expense.css";

const Expense = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);
  const [combinedData, setCombinedData] = useState([]);
  const [flag, setFlag] = useState(0);

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

  const sendFileToServer = async (
    file,
    maxRetries = 3,
    backoffFactor = 300
  ) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("flag", flag);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await axios.post("/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        updateCombinedData(response.data);
        return; // Exit if the request is successful
      } catch (error) {
        if (attempt < maxRetries - 1) {
          const waitTime = backoffFactor * 2 ** attempt; // Exponential backoff
          console.warn(`Upload failed, retrying in ${waitTime}ms...`, error);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        } else {
          console.error("There was an error uploading the image!", error);
          throw error; // Rethrow the error after the final attempt
        }
      }
    }
  };

  const sendTextToServer = async (text) => {
    try {
      const response = await axios.post("/text", { text });
      updateCombinedData(response.data);
    } catch (error) {
      console.error("Error sending text to server:", error);
    }
  };

  const updateCombinedData = (newResult) => {
    if (newResult) {
      const newData = newResult.items.map((item, index) => ({
        item: item.length > 20 ? item.slice(0, 20) : item,
        class: newResult.class[index],
      }));
      setCombinedData((prevData) => [...prevData, ...newData]);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    document.getElementById("file-input").value = "";
  };

  const downloadCSV = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/download-csv", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", "data.csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const toggleFlag = () => {
    setFlag((prevFlag) => (prevFlag === 0 ? 1 : 0));
  };

  const columns = [
    {
      name: "Item",
      selector: (row) => row.item,
      sortable: true,
    },
    {
      name: "Class",
      selector: (row) => row.class,
      sortable: true,
    },
  ];

  return (
    <div className="expense">
      <div className="component">
        <div className="component">
          <div className="text-container">
            <div className="text">
              SORT and SAVE,
              <br />
              your Money, your Way
            </div>
            <div className="description">
              Effortlessly navigate your finances!
              <br />
              Categorize expenses, chart your budget, and thrive financially
              with ease
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
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </div>
              <input
                className="description-input"
                type="text"
                placeholder="Enter description..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button className="submit-button" onClick={handleSubmit}>
                Submit
              </button>
            </div>
            {uploadedImage && (
              <div className="image-container">
                <img
                  className="uploaded-image"
                  src={uploadedImage}
                  alt="Uploaded"
                />
                <button className="close-button" onClick={handleRemoveImage}>
                  <FaTimes size={20} />
                </button>
              </div>
            )}
          </div>
          {combinedData.length > 0 && (
            <div className="result-container">
              <DataTable
                className="dataTable-container"
                columns={columns}
                data={combinedData}
                pagination
                paginationPerPage={5}
              />
              <button className="download-button" onClick={downloadCSV}>
                Download CSV
              </button>
              <button
                className="submit-button"
                style={{ marginLeft: 12 }}
                onClick={(e) => setCombinedData([])}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expense;
