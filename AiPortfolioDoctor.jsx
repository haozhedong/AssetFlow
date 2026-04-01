import React from 'react';

const AiPortfolioDoctor = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">AI Portfolio Doctor</h1>
      <p className="text-lg mb-2">Transform your portfolio with AI-driven insights.</p>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-3">Features</h2>
        <ul className="list-disc pl-5">
          <li className="mb-1">Personalized recommendations</li>
          <li className="mb-1">AI analysis of your assets</li>
          <li className="mb-1">Performance tracking</li>
        </ul>
      </div>
      <h2 className="text-2xl font-semibold mt-6 mb-3">Get Started</h2>
      <p className="mb-4">Sign up today for a free trial and take the first step towards optimizing your portfolio.</p>
      <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded">Sign Up</button>
    </div>
  );
};

export default AiPortfolioDoctor;