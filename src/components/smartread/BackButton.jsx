import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = ({ to = '/smartread', text = 'Quay lại' }) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
    >
      <FaArrowLeft className="mr-2" />
      {text}
    </button>
  );
};

export default BackButton;
