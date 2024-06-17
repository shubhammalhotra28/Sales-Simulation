import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Storage, Amplify } from 'aws-amplify';
import MicRecorder from 'mic-recorder-to-mp3';
// import awsconfig from '../aws-exports'; // Import your Amplify configuration

const TaskPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const candidate = location.state?.candidate || {};
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [recorder, setRecorder] = useState(null);

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
    // Configure Amplify again if needed
    // Amplify.configure(awsconfig);

    console.log('Submitting recording...');
    try {
      const email = candidate.email || 'unknown_user';  // Use candidate's email or 'unknown_user' if not available
      const audioKey = `${email}/${getFormattedDateTime()}.mp3`;  // Custom key with email and timestamp
      const s3BucketUrl = 'https://take2ais3bucket17aa7-dev.us-east-1.amazonaws.com';  // Include region in the S3 URL
      // https://audiofilestorage8ea4a-main.s3.us-east-1.amazonaws.com/
      const region = 'us-east-1'; // Replace with your AWS region

      await Storage.put(audioKey, recording, {
        contentType: 'audio/mp3',
        region: region
      });

      console.log('Audio uploaded to S3:', `${s3BucketUrl}/${audioKey}`);
      navigate('/feedback');
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  const handleRerecord = () => {
    setRecording(null);
    setIsRecording(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Sales Simulation Task</h1>
      <p style={styles.prompt}>Record an audio selling a healthcare service:</p>
      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={handleStartRecording} disabled={isRecording || isBlocked}>
          {isRecording ? 'Recording...' : 'Start Recording'}
        </button>
        <button style={styles.button} onClick={handleStopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
        <button style={{ ...styles.button, ...(!recording ? styles.disabledButton : styles.activeButton) }} onClick={handleRerecord} disabled={!recording}>
          Re-record
        </button>
        <button style={styles.submitButton} onClick={handleSubmit} disabled={!recording}>
          Submit
        </button>
      </div>
      <br />
      <Link to="/" style={styles.link}>Cancel and Return to Landing Page</Link>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: 'auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center',
    fontSize: '28px',
    color: '#333',
  },
  prompt: {
    fontSize: '18px',
    color: '#555',
    marginBottom: '20px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    margin: '0 10px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    margin: '0 10px',
    cursor: 'pointer',
    disabled: {
      cursor: 'not-allowed',
      opacity: '0.6',
    },
  },
  disabledButton: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
    opacity: '0.6',
  },
  activeButton: {
    backgroundColor: '#dc3545',
  },
  link: {
    display: 'block',
    textAlign: 'center',
    marginTop: '20px',
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default TaskPage;
