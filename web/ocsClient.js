const CALL_STATES = {
  idle: "Idle",
  connecting: "Connecting",
  ringing: "Ringing",
  connected: "Connected",
  held: "Held",
  ended: "Ended",
};

class MockCallSession {
  constructor(onStateChange) {
    this.state = CALL_STATES.idle;
    this.onStateChange = onStateChange;
  }

  updateState(nextState) {
    this.state = nextState;
    if (this.onStateChange) {
      this.onStateChange(nextState);
    }
  }

  async hold() {
    this.updateState(CALL_STATES.held);
  }

  async resume() {
    this.updateState(CALL_STATES.connected);
  }

  async hangUp() {
    this.updateState(CALL_STATES.ended);
  }
}

class MockOcsClient {
  constructor(logger) {
    this.logger = logger;
    this.callSession = null;
  }

  async initializeAgent({ userId }) {
    this.logger(`Mock agent initialized for ${userId}.`);
  }

  async startCall({ calleeId }, onStateChange) {
    this.callSession = new MockCallSession(onStateChange);
    this.callSession.updateState(CALL_STATES.connecting);
    setTimeout(() => this.callSession?.updateState(CALL_STATES.connected), 900);
    this.logger(`Mock call started to ${calleeId}.`);
    return this.callSession;
  }

  async acceptCall(onStateChange) {
    this.callSession = new MockCallSession(onStateChange);
    this.callSession.updateState(CALL_STATES.connected);
    this.logger("Mock incoming call accepted.");
    return this.callSession;
  }
}

class OcsSdkClient {
  constructor(logger) {
    this.logger = logger;
    this.callSession = null;
  }

  async initializeAgent({ token, userId }) {
    if (!window.OCS) {
      throw new Error("OCS SDK not loaded. Add the SDK script to index.html.");
    }

    this.logger(`Initializing OCS agent for ${userId}...`);
    this.agent = await window.OCS.createCallAgent({ token, userId });
    this.agent.on("incomingCall", (call) => {
      this.incomingCall = call;
    });
  }

  async startCall({ calleeId }, onStateChange) {
    this.callSession = await this.agent.startCall({ calleeId });
    this.callSession.on("stateChanged", (state) => onStateChange(state));
    return this.callSession;
  }

  async acceptCall(onStateChange) {
    if (!this.incomingCall) {
      throw new Error("No incoming call to accept.");
    }

    this.callSession = await this.incomingCall.accept();
    this.callSession.on("stateChanged", (state) => onStateChange(state));
    return this.callSession;
  }
}

export function createOcsClient(logger) {
  if (window.OCS) {
    return new OcsSdkClient(logger);
  }

  logger("OCS SDK not detected. Using mock client.");
  return new MockOcsClient(logger);
}

export { CALL_STATES };
