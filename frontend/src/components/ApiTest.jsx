import { useState } from 'react';
import { authAPI } from '../services/authService';

const ApiTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setResult(`Health Check: ${data.message}`);
    } catch (error) {
      setResult(`Health Check Error: ${error.message}`);
    }
    setLoading(false);
  };

  const testSignup = async () => {
    setLoading(true);
    try {
      const result = await authAPI.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      setResult(`Signup: ${result.success ? 'Success' : result.error}`);
    } catch (error) {
      setResult(`Signup Error: ${error.message}`);
    }
    setLoading(false);
  };

  const testSignin = async () => {
    setLoading(true);
    try {
      const result = await authAPI.login('test@example.com', 'password123');
      setResult(`Signin: ${result.success ? 'Success' : result.error}`);
    } catch (error) {
      setResult(`Signin Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>API Test Component</h2>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testHealthCheck} disabled={loading} style={{ marginRight: '10px' }}>
          Test Health Check
        </button>
        <button onClick={testSignup} disabled={loading} style={{ marginRight: '10px' }}>
          Test Signup
        </button>
        <button onClick={testSignin} disabled={loading}>
          Test Signin
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {result && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default ApiTest;