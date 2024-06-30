import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Storage } from 'aws-amplify';
import MicRecorder from 'mic-recorder-to-mp3';
import { API } from 'aws-amplify';
import { TailSpin } from 'react-loader-spinner';
import '../assets/index.css';

const TaskPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const candidate = location.state?.candidate || {};
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [userDetails, setUserDetails] = useState(candidate);
  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phone: false,
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [updateResponse, setUpdateResponse] = useState('');
  const [oldUserDetails, setOldUserDetails] = useState({ ...candidate });

  useEffect(() => {
    navigator.getUserMedia(
      { audio: true, video: false },
      () => {
        console.log('Permission Granted');
        setIsBlocked(false);
      },
      () => {
        console.log('Permission Denied');
        setIsBlocked(true);
      }
    );
  }, []);

  useEffect(() => {
    const newRecorder = new MicRecorder({ bitRate: 128 });
    setRecorder(newRecorder);
  }, []);

  useEffect(() => {
    saveUserDetailsOnLoad();
  }, []);

  const saveUserDetailsOnLoad = async () => {
    try {
      const data = await API.post('updateUserInfo', '/updateUserInfo', {
        headers: {},
        body: { newUserDetails: candidate },
      });
      console.log('User details saved on load:', data);
    } catch (error) {
      console.error('Error saving user details on load:', error);
    }
  };

  const handleStartRecording = () => {
    if (isBlocked) {
      alert('Microphone access is blocked. Please enable it to proceed.');
      return;
    }
    console.log('Started recording...');
    recorder.start().then(() => {
      setIsRecording(true);
    }).catch((e) => console.error(e));
  };

  const handleStopRecording = () => {
    console.log('Stopped recording...');
    recorder.stop().getMp3().then(([buffer, blob]) => {
      const audioBlob = new Blob(buffer, { type: blob.type });
      setRecording(audioBlob);
      setIsRecording(false);
    }).catch((e) => console.error(e));
  };

  const getFormattedDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `${date}_${time}`;
  };

  const handleSubmit = async () => {
    console.log('Submitting recording...');
    setIsLoading(true);
    try {
      const email = userDetails.email || 'unknown_user';  // Use userDetails' email or 'unknown_user' if not available
      const audioKey = `public/${email}/${getFormattedDateTime()}.mp3`;  // Custom key with email and timestamp

      // Upload the file with public-read ACL
      await Storage.put(audioKey, recording, {
        contentType: 'audio/mp3',
        level: 'public'  // Ensure the object is publicly accessible
      });

      // Get the public URL of the uploaded file
      const s3Url = await Storage.get(audioKey, {
        level: 'public'
      });

      // Update user details
      await handleSaveDetails();

      const data = await API.post('postTake2AiData', '/postTake2AiData', {
        headers: {},
        body: {
          name: userDetails.name,
          email: userDetails.email,
          phone_number: userDetails.phone,
          s3_url: s3Url,
        },
      });
      console.log(data);

      console.log('done');
      setIsLoading(false);
      navigate('/feedback', { state: { candidate: userDetails, feedbackData: data } });  // Pass updated userDetails data and feedback to FeedbackPage
    } catch (error) {
      console.error('Error uploading audio:', error);
      setIsLoading(false);
    }
  };

  const handleRerecord = () => {
    setRecording(null);
    setIsRecording(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
    };
    let isValid = true;

    // Name validation (no special characters)
    if (!/^[a-zA-Z\s]+$/.test(userDetails.name)) {
      newErrors.name = 'Name must contain only letters and spaces.';
      isValid = false;
    }

    // Email validation (basic format check)
    if (!/\S+@\S+\.\S+/.test(userDetails.email)) {
      newErrors.email = 'Email is invalid.';
      isValid = false;
    }

    // Phone validation (must be numeric)
    if (!/^\d+$/.test(userDetails.phone)) {
      newErrors.phone = 'Phone number must contain only digits.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveDetails = async () => {
    if (!validateForm()) return;
    try {
      const data = await API.put('updateUserInfo', '/updateUserInfo', {
        headers: {},
        body: { oldUserDetails, newUserDetails: userDetails },
      });
      setUpdateResponse('User details updated successfully');
      console.log('User details updated:', data);
    } catch (error) {
      setUpdateResponse('Error updating user details');
      console.error('Error updating user details:', error);
    }
  };

  const toggleEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveField = (field) => {
    if (validateForm()) {
      handleSaveDetails();
      toggleEdit(field);
      setOldUserDetails({ ...userDetails });
    }
  };

  return (
    <div className="body-container">
      <div className="container">
        <h1 className="heading">Sales Simulation Task</h1>
        <div className="userInfo">
          <div className="formGroup">
            <label className="label">Name:</label>
            {isEditing.name ? (
              <input
                type="text"
                name="name"
                value={userDetails.name}
                onChange={handleInputChange}
                className="input"
              />
            ) : (
              <span className="userData">{userDetails.name}</span>
            )}
            {errors.name && <p className="error">{errors.name}</p>}
            <div className="buttonContainer">
              <button className="editButton" onClick={() => toggleEdit('name')}>
                {isEditing.name ? 'Cancel' : 'Edit'}
              </button>
              {isEditing.name && (
                <button className="saveButton" onClick={() => handleSaveField('name')}>
                  Save
                </button>
              )}
            </div>
          </div>
          <div className="formGroup">
            <label className="label">Email:</label>
            {isEditing.email ? (
              <input
                type="email"
                name="email"
                value={userDetails.email}
                onChange={handleInputChange}
                className="input"
              />
            ) : (
              <span className="userData">{userDetails.email}</span>
            )}
            {errors.email && <p className="error">{errors.email}</p>}
            <div className="buttonContainer">
              <button className="editButton" onClick={() => toggleEdit('email')}>
                {isEditing.email ? 'Cancel' : 'Edit'}
              </button>
              {isEditing.email && (
                <button className="saveButton" onClick={() => handleSaveField('email')}>
                  Save
                </button>
              )}
            </div>
          </div>
          <div className="formGroup">
            <label className="label">Phone:</label>
            {isEditing.phone ? (
              <input
                type="tel"
                name="phone"
                value={userDetails.phone}
                onChange={handleInputChange}
                className="input"
              />
            ) : (
              <span className="userData">{userDetails.phone}</span>
            )}
            {errors.phone && <p className="error">{errors.phone}</p>}
            <div className="buttonContainer">
              <button className="editButton" onClick={() => toggleEdit('phone')}>
                {isEditing.phone ? 'Cancel' : 'Edit'}
              </button>
              {isEditing.phone && (
                <button className="saveButton" onClick={() => handleSaveField('phone')}>
                  Save
                </button>
              )}
            </div>
          </div>
          {updateResponse && <p className="updateResponse">{updateResponse}</p>}
        </div>
        <p className="prompt">Record an audio selling a healthcare service:</p>
        <div className="buttonGroup">
          <button className="button" onClick={handleStartRecording} disabled={isRecording || isBlocked}>
            {isRecording ? 'Recording...' : 'Start Recording'}
          </button>
          <button className="button" onClick={handleStopRecording} disabled={!isRecording}>
            Stop Recording
          </button>
          <button className={`button ${!recording ? 'disabledButton' : 'activeButton'}`} onClick={handleRerecord} disabled={!recording}>
            Re-record
          </button>
          <button className="submitButton" onClick={handleSubmit} disabled={!recording || isLoading}>
            Submit
          </button>
        </div>
        {isLoading && <div className="loaderContainer"><TailSpin color="#00BFFF" height={80} width={80} /></div>}
        <br />
        <Link to="/" className="link">Cancel and Return to Landing Page</Link>
      </div>
    </div>
  );
};

export default TaskPage;
