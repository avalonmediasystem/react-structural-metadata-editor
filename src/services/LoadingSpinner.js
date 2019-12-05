import React from 'react';

const LoadingSpinner = ({ isLoading }) => {
    return isLoading ? <div className="loading-spinner" /> : null;
}

export default LoadingSpinner;