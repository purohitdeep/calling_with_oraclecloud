# Oracle Communication Services VoIP POC

This repository contains a proof-of-concept (POC) web application for **Oracle Communication Services (OCS)** VoIP calling between two devices. The goal is to provide a minimal, easy-to-understand UI and call-flow that you can wire up to your OCS project for real-time voice calling.

> **Scope**: VoIP calling between OCS identities only. PSTN/number-based calling is intentionally excluded for this phase.

## What this POC provides

- **VoIP call initiation** between two OCS users.
- **Call lifecycle management** (connect, hold/resume, end).
- **Minimal UI** to start/end calls and observe call state.

## Architecture overview

```
Browser UI (HTML/JS)
   └── ocsClient.js (SDK adapter)
          ├── OCS Web SDK (runtime)
          └── Optional mock fallback (local testing)
```

The `ocsClient.js` module abstracts the OCS Web SDK. If the SDK is available at runtime, it will be used. Otherwise, a mock implementation is used so you can run the UI locally without a live OCS environment.

## Oracle Cloud configuration (required for real calls)

1. **Create or choose an OCS instance** in Oracle Cloud.
2. **Create an OCS application** that allows VoIP calling.
3. **Provision user identities** (two users for caller/callee).
4. **Enable and configure voice calling** in the OCS application settings.
5. **Retrieve SDK configuration**:
   - Application/tenant identifiers.
   - User access tokens for each identity.
   - TURN/STUN configuration if required by your network.
6. **Host the SDK**:
   - Add the OCS Web SDK script tag to `web/index.html` (see inline comment for placement).
7. **Populate configuration**:
   - Update the in-page configuration or wire in a server-side token service for production use.

> **Security note**: For production, use a backend service to mint tokens for each user and never embed long-lived tokens in the client.

## Running the POC locally (mock mode)

You can run the app without an OCS environment to explore the UI and call flow:

```bash
cd web
python3 -m http.server 5173
```

Then open `http://localhost:5173` in two browser tabs to simulate a caller and callee.

## Running with Oracle Communication Services

1. Add the OCS Web SDK script to `web/index.html` (follow the comment in the file).
2. Replace the mock configuration in `web/app.js` with real user identities and tokens.
3. Load the page in two browsers (or two devices) and place a call from one user to the other.

## Next steps (future phase)

- Add PSTN/number-based calling once VoIP is stable.
- Implement a backend token service.
- Add real-time presence and call notifications.

## File guide

- `web/index.html` — Minimal UI and SDK script hook.
- `web/styles.css` — Lightweight styling.
- `web/app.js` — UI logic and call lifecycle handling.
- `web/ocsClient.js` — Adapter for OCS Web SDK (with mock fallback).
