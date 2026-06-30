import Link from "next/link";

export default function ChooseDemoPage() {
  return (
    <main className="choose-demo-page">
      <div className="choose-demo-container">
        <h1 className="choose-demo-title">Choose Demo</h1>

        <p className="choose-demo-description">
          The Project Tracker web app offers different experiences. If you&apos;re
          unsure, choose resident to see the default view.
        </p>

        <div className="choose-demo-cards">
          {/* Resident Card — links to dashboard */}
          <Link href="/dashboard" className="demo-card demo-card-active">
            <h2 className="demo-card-heading">Log in as Resident</h2>
            <p className="demo-card-text">
              This view shows how information layout is shown to the public and
              how residents can interact.
            </p>
          </Link>

          {/* Township Card — disabled */}
          <div className="demo-card demo-card-disabled" aria-disabled="true">
            <h2 className="demo-card-heading">Log in as Township</h2>
            <p className="demo-card-text">
              This view shows all management and editing tools, as well as all
              feedback.
            </p>
            <span className="demo-card-badge">Coming Soon</span>
          </div>
        </div>

        <p className="choose-demo-contact">
          Need help? Contact:{" "}
          <a href="mailto:colliertownship@andrew.cmu.edu">
            colliertownship@andrew.cmu.edu
          </a>
        </p>
      </div>
    </main>
  );
}
