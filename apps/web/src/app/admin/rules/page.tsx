import { RulesDashboard } from "@/features/admin/RulesDashboard";

export default function RulesPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0b] overflow-auto">
      <div className="max-w-6xl mx-auto w-full p-8">
        <RulesDashboard />
      </div>
    </div>
  );
}
