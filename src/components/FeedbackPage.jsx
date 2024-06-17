import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API } from 'aws-amplify';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const candidate = location.state?.candidate || {};
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await API.get('fetchTake2AiData', '/fetchTake2AiData', {
          queryStringParameters: {
            email: candidate.email,
            name: candidate.name,
          }
        });
        setScore(response.latest_score);
        setFeedback(response.latest_feedback);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };

    fetchFeedback();
  }, [candidate.email, candidate.name]);

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
