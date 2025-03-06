export const handler = async (event) => {
    console.log("Function triggered with event:", JSON.stringify(event, null, 2));
    const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/xxxxxxxxx{your slack webhook here}"
  
    const { detail, region = "us-east-1" } = event;
    const { appId, branchName, jobId, jobStatus } = detail || {};
    
    const buildUrl = `https://${region}.console.aws.amazon.com/amplify/apps/${appId}/branches/${branchName}/deployments?region=${region}`;
    
    // Get appropriate status info
    const { emoji, message } = getStatusInfo(jobStatus);
  
    // Create Slack message
    const slackMessage = {
      text: `${emoji} Amplify Build for *${branchName || "unknown branch"}* ${message}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${emoji} *Amplify Build Update*\n• App ID: \`${appId || "unknown"}\`\n• Branch: \`${branchName || "unknown"}\`\n• Job ID: \`${jobId || "unknown"}\`\n• Status: *${message}*`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `👀 <${buildUrl}|View build in AWS Console>`
          }
        }
      ]
    };
  
    try {
      // Send to Slack using fetch
      const response = await fetch(
        SLACK_WEBHOOK_URL, 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slackMessage)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status} ${await response.text()}`);
      }
      
      console.log("Message sent to Slack successfully");
      return { statusCode: 200, body: "Notification sent" };
      
    } catch (error) {
      console.error("Failed to send message to Slack:", error);
      return { statusCode: 500, body: "Failed to send notification" };
    }
  };
  function getStatusInfo(status) {
    switch(status) {
      case "SUCCEED":
        return { emoji: "✅", message: "succeeded 🎉" };
      case "FAILED":
        return { emoji: "❌", message: "failed 😢" };
      case "STARTED":
        return { emoji: "🆕", message: "started" };
      case "PENDING":
        return { emoji: "⏳", message: "pending" };
      case "CANCELLED":
        return { emoji: "🚫", message: "cancelled" };
      default:
        return { emoji: "ℹ️", message: status || "unknown" };
    }
  }
