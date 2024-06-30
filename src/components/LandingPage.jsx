import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/index.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleChange = (e) => {
    setCandidate({ ...candidate, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: ''
    };
    let isValid = true;

    // Name validation (no special characters)
    if (!/^[a-zA-Z\s]+$/.test(candidate.name)) {
      newErrors.name = 'Name must contain only letters and spaces.';
      isValid = false;
    }

    // Email validation (basic format check)
    if (!/\S+@\S+\.\S+/.test(candidate.email)) {
      newErrors.email = 'Email is invalid.';
      isValid = false;
    }

    // Phone validation (must be numeric)
    if (!/^\d+$/.test(candidate.phone)) {
      newErrors.phone = 'Phone number must contain only digits.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Pass candidate data to Task Page
      navigate('/task', { state: { candidate } });
    }
  };

  return (
    <div className="background-container">
      <div className="container">
        <h1 className="heading"> Sales Simulation</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="formGroup">
            <label htmlFor="name" className="label">Name:</label>
            <input type="text" id="name" name="name" value={candidate.name} onChange={handleChange} className="input" />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>
          <div className="formGroup">
            <label htmlFor="email" className="label">Email:</label>
            <input type="email" id="email" name="email" value={candidate.email} onChange={handleChange} className="input" />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>
          <div className="formGroup">
            <label htmlFor="phone" className="label">Phone:</label>
            <input type="tel" id="phone" name="phone" value={candidate.phone} onChange={handleChange} className="input" />
            {errors.phone && <p className="error">{errors.phone}</p>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button type="submit" className="button">Start Simulation</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;
