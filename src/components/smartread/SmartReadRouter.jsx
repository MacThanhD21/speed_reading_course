import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SmartReadHomePage from './SmartReadHomePage';
import PasteTextPage from './PasteTextPage';
import ReadingPage from './ReadingPage';
import DemoPage from './DemoPage';
import AITestPage from './AITestPage';
import GeminiTestPage from './GeminiTestPage';

const SmartReadRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<SmartReadHomePage />} />
      <Route path="/paste-text" element={<PasteTextPage />} />
      <Route path="/reading" element={<ReadingPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/ai-test" element={<AITestPage />} />
      <Route path="/gemini-test" element={<GeminiTestPage />} />
      <Route path="*" element={<Navigate to="/smartread" replace />} />
    </Routes>
  );
};

export default SmartReadRouter;
