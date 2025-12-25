"use client";

export default function RegressionAlertPanel({ ledger }: { ledger?: any[] }) {
  if (!ledger || ledger.length === 0) {
    return null;
  }

  const regressionAlerts = ledger.filter(
    (e) => e.type === "agent_regression_alert"
  );

  if (regressionAlerts.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-amber-900">
            Regression Alerts
          </p>
          <p className="mt-1 text-[11px] text-amber-800">
            {regressionAlerts.length} regression{regressionAlerts.length !== 1 ? "s" : ""} detected
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {regressionAlerts.map((e, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-amber-300 bg-white p-2 text-[11px]"
          >
            <div className="flex justify-between">
              <span className="font-semibold text-amber-900">
                Regression Alert
              </span>
              <span className="text-amber-700">
                {new Date(e.createdAt).toLocaleString()}
              </span>
            </div>

            {e.payload && (
              <pre className="mt-2 max-h-32 overflow-auto rounded bg-amber-50 p-2 text-[10px]">
                {JSON.stringify(e.payload, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
