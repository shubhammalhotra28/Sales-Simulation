import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API } from 'aws-amplify';
import '../assets/index.css'

const FeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const candidate = location.state?.candidate || {};
  const feedbackData = location.state?.feedbackData || {};
  const [score, setScore] = useState(feedbackData.latest_score || null);
  const [feedback, setFeedback] = useState(feedbackData.latest_feedback || '');
  const [isDeleting, setIsDeleting] = useState(false);

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

    if (!feedbackData.latest_feedback) {
      fetchFeedback();
    }
  }, [candidate.email, candidate.name, feedbackData]);

  const handleDelete = async () => {
    setIsDeleting(true);
    console.log(feedback);
    try {
      await API.del('deleteSubmission', '/deleteSubmission', {
        body: {
          email: candidate.email,
          name: candidate.name,
          phone_number: candidate.phone_number,
          feedback: feedback
        }
      });
      alert('Submission deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission');
    }
    setIsDeleting(false);
  };

  return (
    <div className="feedback-container">
      <h1 className="feedback-heading">Task Feedback</h1>
      {score !== null && <p className="feedback-score">Score: {score}/10</p>}
      <p className="feedback-title">Feedback:</p>
      <p className="feedback-content">{feedback}</p>
      <br />
      <button
        className="feedback-delete-button"
        onClick={handleDelete}
        disabled={isDeleting || feedback === ''}
      >
        {isDeleting ? 'Deleting...' : 'Delete Submission'}
      </button>
      <br />
      <Link to="/" className="feedback-link">Return to Landing Page</Link>
    </div>
  );
};

export default FeedbackPage;
