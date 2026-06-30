import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import DashboardContent from "@/app/components/DashboardContent";

export default function DashboardPage() {
  return (
    <>
      <div className="flex-shrink-0">
        <Navbar />
      </div>
      <DashboardContent />
      <Footer />
    </>
  );
}
