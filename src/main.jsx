import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react';
ReactDOM.createRoot(document.getElementById('root')).render(
  <Auth0Provider
  domain="dev-i0asge3bstiydyff.us.auth0.com"
  clientId="tkHPC4g4WoLXGKzQjIqth2NUJgDbhHnA"
  authorizationParams={{
     redirect_uri: window.location.origin
    // redirectUri:`chrome-extension://dgicikelginkdihekelgggjboncmaobn/index.html`
  }}
>
  <App />
</Auth0Provider>,
)
