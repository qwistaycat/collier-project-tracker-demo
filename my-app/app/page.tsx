import DemoCard from "@/app/components/DemoCard";

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
          <DemoCard
            title="Log in as Resident"
            description="This view shows how information layout is shown to the public and how residents can interact."
            href="/dashboard"
          />

          <DemoCard
            title="Log in as Township"
            description="This view shows all management and editing tools, as well as all feedback."
            disabled
            badgeText="Coming Soon"
          />
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
