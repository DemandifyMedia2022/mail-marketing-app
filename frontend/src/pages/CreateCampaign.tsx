import { useState } from "react";
import { createCampaign } from "../services/emailService.ts";

interface CreateCampaignProps {
  onDone?: () => void;
}

export default function CreateCampaign({ onDone }: CreateCampaignProps) {
  const [createType, setCreateType] = useState<string>("regular");
  const [createName, setCreateName] = useState<string>("");
  const [createFolder, setCreateFolder] = useState<string>("");
  const [createLoading, setCreateLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!createName.trim()) return;
    try {
      setCreateLoading(true);
      await createCampaign({
        name: createName.trim(),
        type: createType === "ab_test" ? "ab_test" : "regular",
        folder: createFolder.trim(),
      });
      if (onDone) onDone();
    } catch (err) {
      console.error("Failed to create campaign", err);
      alert("Failed to create campaign");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="campaigns-page">
      <div className="campaign-create-card">
        <h2 className="campaign-create-title">Create an email campaign</h2>

        <div className="campaign-create-toggle">
          <button
            type="button"
            className={
              createType === "regular" ? "toggle-pill active" : "toggle-pill"
            }
            onClick={() => setCreateType("regular")}
          >
            Regular
          </button>
          <button
            type="button"
            className={
              createType === "ab_test" ? "toggle-pill active" : "toggle-pill"
            }
            onClick={() => setCreateType("ab_test")}
          >
            A/B Test
          </button>
        </div>

        {createType === "regular" && (
          <p className="campaign-create-desc">
            Keep subscribers engaged by sharing your latest news, promoting your
            bestselling products, or announcing an upcoming event.
          </p>
        )}

        {createType === "ab_test" && (
          <div className="campaign-create-abtest">
            <p className="campaign-create-desc">
              Choose an element to A/B test. Recipients in your test group will
              receive either version A or B. The version with the best
              engagement will be sent to your remaining recipients.
            </p>
            <div className="abtest-cards-row">
              <div className="abtest-card">
                <h3>Subject lines</h3>
                <p>
                  Test two different subject lines to improve your email open
                  rates.
                </p>
              </div>
              <div className="abtest-card">
                <h3>Email content</h3>
                <p>
                  Test two different designs to improve your click rates.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="campaign-create-field">
          <label>Campaign name</label>
          <input
            type="text"
            maxLength={128}
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
          <div className="campaign-create-counter">
            {createName.length}/128
          </div>
        </div>

        <div className="campaign-create-field">
          <label>Folder</label>
          <input
            type="text"
            placeholder="Optional folder name"
            value={createFolder}
            onChange={(e) => setCreateFolder(e.target.value)}
          />
        </div>

        <div className="campaign-create-actions">
          <button
            type="button"
            className="link-button"
            onClick={() => {
              if (onDone) onDone();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!createName.trim() || createLoading}
            onClick={handleSubmit}
          >
            {createType === "ab_test" ? "Create A/B campaign" : "Create campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}
