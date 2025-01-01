import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';

import App from './App.jsx'
import './index.css'

const root = createRoot(document.getElementById('root'));

root.render(
    <Auth0Provider
        domain="dev-5gze5rgawusihxof.us.auth0.com"
        clientId="iCgc65SsBkPwBzhcOr9Qy0M9739q8mQU"
        authorizationParams={{
        redirect_uri: window.location.origin
        }}
    >
        <App />
    </Auth0Provider>
)


