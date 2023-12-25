import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Main = () => {
  // State variables
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [idCardList, setIdCardList] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isEditing, setIsEditing] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false); // Added state for file size error
  const [uploading, setUploading] = useState(false); // Added state for uploading
  const [deletePopup, setDeletePopup] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Event handler for file input change
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.size > 2 * 1024 * 1024) { // 2MB limit
      setFile(null);
      setFileSizeError(true);
    } else {
      setFile(selectedFile);
      setFileSizeError(false);
    }
  };

  // Event handler for file upload
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Make an HTTP request to upload the file
      const response = await axios.post('https://thai-id-ocr-backend.onrender.com/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update state and show success popup
      const newIdCard = response.data;
      setShowSuccessPopup(true);
      setIdCardList((prevIdCardList) => [...prevIdCardList, newIdCard]);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      // Handle errors during file upload
      console.error('Error uploading file:', error);

      setShowErrorPopup(true);
      setTimeout(() => {
        setShowErrorPopup(false);
      }, 3000);

      if (error.response && error.response.status === 400 && error.response.data.error) {
        setErrorMessage(error.response.data.error);
        setTimeout(() => {
          setErrorMessage('');
        }, 3500);
      }

    } finally {
      setUploading(false); // Set uploading back to false after upload completion
    }
  };

  // Event handler for search input with Enter key
  const handleSearchWithEnter = (event) => {
    if (event.key === 'Enter') {
      // Filter data based on search input
      const searchInput = searchTerm;
      const tempFilteredData = idCardList.filter((entry) => {
        return Object.values(entry).some((value) =>
          value.toString().toLowerCase().includes(searchInput.toLowerCase())
        );
      });
      setIdCardList(tempFilteredData);
    }
  };

  // Event handler for search button click
  const handleSearchWithButton = () => {
    // Filter data based on search input
    const searchInput = searchTerm;
    const tempFilteredData = idCardList.filter((entry) => {
      return Object.values(entry).some((value) =>
        value.toString().toLowerCase().includes(searchInput.toLowerCase())
      );
    });
    setIdCardList(tempFilteredData);
  };

  // Event handler for editing a row
  const handleEdit = (id) => {
    // Toggle the edit mode for the clicked row
    setIsEditing((prevEditing) => ({ ...prevEditing, [id]: true }));
  };

  // Event handler for updating a row
  const handleUpdate = async (id) => {
    // Find the entry in the local state by ID
    const updatedEntry = idCardList.find(entry => entry._id === id);

    try {
      // Make an HTTP request to update the entry in the database
      const response = await axios.put(`https://thai-id-ocr-backend.onrender.com/idcards/${id}`, updatedEntry);

      // Check if the update was successful
      if (response.status === 200) {
        console.log('ID updated successfully:', response.data);

        // After updating, toggle off the edit mode for the row
        setIsEditing((prevEditing) => ({ ...prevEditing, [id]: false }));
      } else {
        console.error('Failed to update ID:', response.data);
      }
    } catch (error) {
      console.error('Error updating ID card:', error);
    }
  };

  // Effect hook for fetching ID cards
  useEffect(() => {
    const fetchIdCards = async () => {
      try {
        // Make an HTTP request to get ID cards
        const response = await axios.get('https://thai-id-ocr-backend.onrender.com/idcards');
        setIdCardList(response.data);
      } catch (error) {
        console.error('Error fetching ID cards:', error);
      }
    };

    if (showSearch) {
      fetchIdCards();
    }
  }, [showSearch]);


  // Event handler for deleting a row
  const handleDelete = async (id) => {
    console.log(id);
    const updatedEntry = idCardList.find(entry => entry._id === id);
    console.log(updatedEntry._id);
    try {
      // Make an HTTP request to delete the entry from the database
      await axios.delete(`https://thai-id-ocr-backend.onrender.com/idcards/${id}`);

      // Update the local state to reflect the changes
      setIdCardList((prevIdCardList) => prevIdCardList.filter((entry) => entry._id !== id));

      setDeletePopup(`ID "${id}" deleted successfully!`);
      setTimeout(() => {
        setDeletePopup(null);
      }, 3000);

    } catch (error) {
      console.error('Error deleting ID card:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded mb-4 fixed bottom-4 left-4 shadow-md"
          role="alert">
          <span className="block sm:inline">
            Entry added, click show search to see entries.
          </span>
          <button
            onClick={() => setShowSuccessPopup(false)}
            className="ml-2 bg-white text-green-500 px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
      )}
      {/* Error Popup */}
      {showErrorPopup && (
        <div className="bg-gradient-to-r from-red-400 to-red-600 text-white px-4 py-2 rounded mb-4 fixed bottom-4 left-4 shadow-md"
          role="alert">
          <span className="block sm:inline">
            {errorMessage}
          </span>
          <button
            onClick={() => setShowErrorPopup(false)}
            className="ml-2 bg-white text-red-500 px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
      )}
      {/* Delete Popup */}
      {deletePopup && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded mb-4 fixed bottom-4 left-4 shadow-md"
          role="alert">
          <span className="block sm:inline">
            {deletePopup}
          </span>
        </div>
      )}
      {/* Error Message */}
      {errorMessage && (
        <div className="bg-gradient-to-r from-red-400 to-red-600 text-white px-4 py-2 rounded mb-4 fixed bottom-4 left-4 shadow-md" role="alert">
          <span className="block sm:inline">
            {errorMessage}
          </span>
          <button
            onClick={() => setErrorMessage('')}
            className="ml-2 bg-white text-red-500 px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-lg w-3/4 overflow-x-auto transition-all duration-500">
        <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">
          Thai ID Card OCR
        </h1>
        {/* File Input */}
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-2 p-2 border border-gray-300 rounded w-full"
        />
        {/* File Size Error Message */}
        {fileSizeError && (
          <p className="text-red-500 text-sm mt-1">
            File should be less than 2MB.
          </p>
        )}
        {/* File Size Info */}
        <p className="text-gray-500 text-sm">
          Select a file less than 2MB in size.
        </p>
        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || fileSizeError || uploading} // Disable the button during upload
          className={`mt-2 mb-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded ${(!file || fileSizeError || uploading) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
            }`}>
          {uploading ? 'Processing...' : 'Upload'}
        </button>
        {/* Toggle Search Button */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded hover:opacity-80 ml-4 mt-2 mb-3"
        >
          {showSearch ? 'Hide Search' : 'Show Search'}
        </button>
        {/* Search Section */}
        {showSearch && (
          <div className="block items-center mb-4">
            <div className="flex">
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchWithEnter}
                className="p-2 border border-gray-300 rounded flex-grow mr-2 w-full"
              />
              {/* Search Button */}
              <button
                onClick={handleSearchWithButton}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded hover:opacity-80"
                data-tip
                data-for="table-tooltip"
              >
                Search
              </button>
            </div>
            {/* Search Info */}
            <p className="text-red-500 text-sm mt-2">
              Red entries indicate data that was not extracted properly.
            </p>
            {/* Table */}
            <table className="w-full border border-gray-300 mt-4 bg-gradient-to-r from-white to-gray-200 text-gray-800">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <th className="p-2">ID Number</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Last Name</th>
                  <th className="p-2">Date of Birth</th>
                  <th className="p-2">Date of Issue</th>
                  <th className="p-2">Date of Expiry</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {idCardList.map((idCard, index) => (
                  <tr
                    key={idCard._id}
                    className={`
                      
      ${idCard.idNumber.length !== 17 ? 'text-white bg-red-400' : `transition-all duration-300 ${index % 2 === 0
                        ? 'bg-gradient-to-r from-white to-gray-100 hover:bg-gray-200'
                        : 'bg-white hover:bg-gray-100'}`}`}
                  >
                    <td className="p-2">
                      {isEditing[idCard._id] ? (
                        <input
                          type="text"
                          value={idCard.idNumber}
                          onChange={(e) =>
                            setIdCardList((prevIdCardList) =>
                              prevIdCardList.map((entry) =>
                                entry._id === idCard._id ? { ...entry, idNumber: e.target.value } : entry,
                              )
                            )
                          }
                        />
                      ) : (
                        idCard.idNumber
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing[idCard._id] ? (
                        <input
                          type="text"
                          value={idCard.name}
                          onChange={(e) =>
                            setIdCardList((prevIdCardList) =>
                              prevIdCardList.map((entry) =>
                                entry._id === idCard._id ? { ...entry, name: e.target.value } : entry
                              )
                            )
                          }
                        />
                      ) : (
                        idCard.name
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing[idCard._id] ? (
                        <input
                          type="text"
                          value={idCard.lastName}
                          onChange={(e) =>
                            setIdCardList((prevIdCardList) =>
                              prevIdCardList.map((entry) =>
                                entry._id === idCard._id ? { ...entry, lastName: e.target.value } : entry
                              )
                            )
                          }
                        />
                      ) : (
                        idCard.lastName
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing[idCard._id] ? (
                        <input
                          type="text"
                          value={idCard.dateOfBirth}
                          onChange={(e) =>
                            setIdCardList((prevIdCardList) =>
                              prevIdCardList.map((entry) =>
                                entry._id === idCard._id ? { ...entry, dateOfBirth: e.target.value } : entry
                              )
                            )
                          }
                        />
                      ) : (
                        idCard.dateOfBirth
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing[idCard._id] ? (
                        <input
                          type="text"
                          value={idCard.dateOfIssue}
                          onChange={(e) =>
                            setIdCardList((prevIdCardList) =>
                              prevIdCardList.map((entry) =>
                                entry._id === idCard._id ? { ...entry, dateOfIssue: e.target.value } : entry
                              )
                            )
                          }
                        />
                      ) : (
                        idCard.dateOfIssue
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing[idCard._id] ? (
                        <input
                          type="text"
                          value={idCard.dateOfExpiry}
                          onChange={(e) =>
                            setIdCardList((prevIdCardList) =>
                              prevIdCardList.map((entry) =>
                                entry._id === idCard._id ? { ...entry, dateOfExpiry: e.target.value } : entry
                              )
                            )
                          }
                        />
                      ) : (
                        idCard.dateOfExpiry

                      )}
                    </td>
                    <td className="p-2">
                      {isEditing[idCard._id] ? (
                        <button
                          onClick={() => handleUpdate(idCard._id)}
                          className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(idCard._id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(idCard._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;