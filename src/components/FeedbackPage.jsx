import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API } from 'aws-amplify';
import '../assets/index.css'

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
    <div className="container">
      <h1 className="heading">Task Feedback</h1>
      {score !== null && <p className="score">Score: {score}/10</p>}
      <p className="feedbackTitle">Feedback:</p>
      <p className="feedbackContent">{feedback}</p>
      <br />
      <Link to="/" className="link">Return to Landing Page</Link>
    </div>
  );
};

export default FeedbackPage;
