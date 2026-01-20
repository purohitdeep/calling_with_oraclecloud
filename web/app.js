import { CALL_STATES, createOcsClient } from "./ocsClient.js";

const elements = {
  userId: document.getElementById("user-id"),
  accessToken: document.getElementById("access-token"),
  calleeId: document.getElementById("callee-id"),
  initAgent: document.getElementById("init-agent"),
  startCall: document.getElementById("start-call"),
  acceptCall: document.getElementById("accept-call"),
  holdCall: document.getElementById("hold-call"),
  resumeCall: document.getElementById("resume-call"),
  endCall: document.getElementById("end-call"),
  status: document.getElementById("call-status"),
  logOutput: document.getElementById("log-output"),
};

const state = {
  client: null,
  callSession: null,
};

const log = (message) => {
  const timestamp = new Date().toLocaleTimeString();
  elements.logOutput.textContent = `[${timestamp}] ${message}\n${elements.logOutput.textContent}`;
};

const updateStatus = (status) => {
  elements.status.textContent = status;
};

const setControlState = ({ initialized, inCall, canHold }) => {
  elements.startCall.disabled = !initialized || inCall;
  elements.acceptCall.disabled = !initialized || inCall;
  elements.endCall.disabled = !inCall;
  elements.holdCall.disabled = !inCall || !canHold;
  elements.resumeCall.disabled = !inCall || canHold;
};

const handleStateChange = (stateValue) => {
  updateStatus(stateValue);
  if (stateValue === CALL_STATES.connected) {
    setControlState({ initialized: true, inCall: true, canHold: true });
  } else if (stateValue === CALL_STATES.held) {
    setControlState({ initialized: true, inCall: true, canHold: false });
  } else if (stateValue === CALL_STATES.ended) {
    state.callSession = null;
    setControlState({ initialized: true, inCall: false, canHold: false });
  }
};

const initializeClient = () => {
  state.client = createOcsClient(log);
};

const initializeAgent = async () => {
  const userId = elements.userId.value.trim();
  const token = elements.accessToken.value.trim();

  if (!userId) {
    log("Provide a user ID before initializing.");
    return;
  }

  try {
    await state.client.initializeAgent({ userId, token });
    updateStatus("Agent initialized");
    setControlState({ initialized: true, inCall: false, canHold: false });
  } catch (error) {
    log(error.message);
  }
};

const startCall = async () => {
  const calleeId = elements.calleeId.value.trim();
  if (!calleeId) {
    log("Provide a callee user ID.");
    return;
  }

  try {
    state.callSession = await state.client.startCall({ calleeId }, handleStateChange);
    updateStatus("Calling...");
    setControlState({ initialized: true, inCall: true, canHold: true });
  } catch (error) {
    log(error.message);
  }
};

const acceptCall = async () => {
  try {
    state.callSession = await state.client.acceptCall(handleStateChange);
    updateStatus("Connected");
    setControlState({ initialized: true, inCall: true, canHold: true });
  } catch (error) {
    log(error.message);
  }
};

const holdCall = async () => {
  if (!state.callSession) {
    return;
  }
  await state.callSession.hold();
  handleStateChange(CALL_STATES.held);
};

const resumeCall = async () => {
  if (!state.callSession) {
    return;
  }
  await state.callSession.resume();
  handleStateChange(CALL_STATES.connected);
};

const endCall = async () => {
  if (!state.callSession) {
    return;
  }
  await state.callSession.hangUp();
  handleStateChange(CALL_STATES.ended);
};

initializeClient();
setControlState({ initialized: false, inCall: false, canHold: false });
updateStatus("Not initialized");

elements.initAgent.addEventListener("click", initializeAgent);
elements.startCall.addEventListener("click", startCall);
elements.acceptCall.addEventListener("click", acceptCall);
elements.holdCall.addEventListener("click", holdCall);
elements.resumeCall.addEventListener("click", resumeCall);
elements.endCall.addEventListener("click", endCall);
