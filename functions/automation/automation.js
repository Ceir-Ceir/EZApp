// functions/automation.js
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const fetch = require('node-fetch');


exports.runPythonAutomation = onDocumentUpdated("users/{userId}", async (event) => {
  const userId = event.params.userId;
  console.log(`👀 Detected update to user: ${userId}`);

  try {
    const automationServiceUrl = process.env.AUTOMATION_SERVICE_URL;
    if (!automationServiceUrl) {
      throw new Error("AUTOMATION_SERVICE_URL not configured");
    }

    const response = await fetch(`${automationServiceUrl}/run-automation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, timestamp: new Date().toISOString() })
    });

    if (!response.ok) {
      throw new Error(`Automation service responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Automation service response:", result);
    return result;
  } catch (error) {
    console.error("❌ Automation service error:", error);
    throw error;
  }
});
