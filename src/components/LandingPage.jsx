import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div style={styles.container}>
      <h1 style={styles.heading}>Acumen Healthcare Sales Simulation</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>Name:</label>
          <input type="text" id="name" name="name" value={candidate.name} onChange={handleChange} style={styles.input} />
          {errors.name && <p style={styles.error}>{errors.name}</p>}
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Email:</label>
          <input type="email" id="email" name="email" value={candidate.email} onChange={handleChange} style={styles.input} />
          {errors.email && <p style={styles.error}>{errors.email}</p>}
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="phone" style={styles.label}>Phone:</label>
          <input type="tel" id="phone" name="phone" value={candidate.phone} onChange={handleChange} style={styles.input} />
          {errors.phone && <p style={styles.error}>{errors.phone}</p>}
        </div>
        <button type="submit" style={styles.button}>Start Simulation</button>
      </form>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    marginBottom: '5px',
    fontSize: '16px',
    color: '#555',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'center',
    marginTop: '10px',
  },
  error: {
    color: 'red',
    fontSize: '14px',
  }
};

export default LandingPage;
