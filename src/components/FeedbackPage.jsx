import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Fetch score and feedback from backend API (simulated for demonstration)
    const fetchFeedback = async () => {
      // Simulated response
      const simulatedScore = 8.5;
      const simulatedFeedback = "Good grammar and clear communication. Work on emphasizing benefits more.";

      setScore(simulatedScore);
      setFeedback(simulatedFeedback);
    };

    fetchFeedback();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Task Feedback</h1>
      {score !== null && <p style={styles.score}>Score: {score}/10</p>}
      <p style={styles.feedbackTitle}>Feedback:</p>
      <p style={styles.feedbackContent}>{feedback}</p>
      <br />
      <Link to="/" style={styles.link}>Return to Landing Page</Link>
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
  score: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  feedbackTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '20px',
  },
  feedbackContent: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginTop: '10px',
  },
  link: {
    display: 'block',
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '16px',
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default FeedbackPage;
