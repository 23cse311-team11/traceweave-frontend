'use client';

import React from 'react';

const NotFound = () => {
  return (
    <div className='flex items-center justify-center h-screen bg-bg-base'>
        <div className='flex flex-col items-center gap-4'>
            <h1 className='text-4xl font-bold text-text-primary'>404 - Page Not Found</h1>
            <p className='text-text-secondary'>The page you are looking for does not exist.</p>
            <button className='px-4 py-2 bg-brand-orange text-white rounded hover:bg-brand-orange/80' onClick={() => window.history.back()}>Go Back</button>
        </div>
    </div>
  )
}

export default NotFound;