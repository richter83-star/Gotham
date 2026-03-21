import { ApprovalsQueue } from "@/features/admin/ApprovalsQueue";

export default function ApprovalsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Governance & Approvals</h1>
        <ApprovalsQueue />
      </div>
    </div>
  );
}
