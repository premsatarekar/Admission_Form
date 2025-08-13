// client/src/components/UI/Loader.js
import React from 'react';
import { CircularProgress } from '@mui/material';
import styled from 'styled-components';

const LoaderContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: rgba(255, 255, 255, 0.8);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
`;

const Loader = () => (
    <LoaderContainer>
        <CircularProgress size={60} />
    </LoaderContainer>
);

export default Loader;