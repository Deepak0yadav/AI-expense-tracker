import { Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Legend textual states used instead of simple yes/no
// LIMITED: Available but requires heavy manual setup or lacks automation
// MANUAL: Only possible through manual formulas / effort
// VARIES: Depends on the specific app implementation / plan
const LIMITED = "Limited";
const MANUAL = "Manual";
const VARIES = "Varies";

const features = [
  { key: "automated", label: "Automated expense tracking", fg: true, sheet: false, generic: LIMITED },
  { key: "viz", label: "Data visualization (charts & graphs)", fg: true, sheet: MANUAL, generic: true },
  { key: "sync", label: "Multi-device sync", fg: true, sheet: false, generic: true },
  { key: "budget", label: "Budget planning tools", fg: true, sheet: MANUAL, generic: true },
  { key: "security", label: "Security & privacy (encryption)", fg: true, sheet: false, generic: VARIES },
  { key: "export", label: "Export options (CSV / PDF)", fg: true, sheet: true, generic: true },
  { key: "ai", label: "AI recommendations & insights", fg: true, sheet: false, generic: false },
];

type CellValue = boolean | string;

function Cell({ value }: { value: CellValue }) {
  if (value === true) {
    return (
      <div className="flex h-full w-full items-center justify-center" aria-label="Included">
        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex h-full w-full items-center justify-center" aria-label="Not included">
        <X className="w-4 h-4 text-red-500" />
      </div>
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="text-[10px] leading-none uppercase tracking-wide text-foreground/60 font-semibold bg-muted/40 px-2 py-1 rounded-md inline-block whitespace-nowrap">
        {value}
      </span>
    </div>
  );
}

export default function Comparison() {
  return (
    <section id="comparison" className="py-24 px-4 bg-gradient-to-b from-background to-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="text-gradient">FinGenius</span>?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">See how FinGenius stacks up against spreadsheets and generic tracking apps.</p>
        </div>

        <ScrollArea className="w-full rounded-lg border border-border/50 overflow-hidden">
          <table
            className="w-full text-sm md:text-base border-collapse min-w-[760px] table-fixed"
            role="table"
            aria-label="Feature comparison table"
          >
            <colgroup>
              {/* Feature label wider */}
              <col className="w-[40%]" />
              {/* Each competitor column equal width */}
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Feature</th>
                <th className="py-3 px-4 font-semibold text-center">FinGenius</th>
                <th className="py-3 px-4 font-semibold text-center">Spreadsheet</th>
                <th className="py-3 px-4 font-semibold text-center">Generic App</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr
                  key={f.key}
                  className="odd:bg-background even:bg-muted/30 hover:bg-primary/5 transition-colors align-middle"
                >
                  <td className="py-3 px-4 font-medium text-foreground/90 break-words">{f.label}</td>
                  <td className="py-3 px-4 text-center align-middle"><Cell value={f.fg} /></td>
                  <td className="py-3 px-4 text-center align-middle"><Cell value={f.sheet as CellValue} /></td>
                  <td className="py-3 px-4 text-center align-middle"><Cell value={f.generic as CellValue} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>

        <div className="mt-6 text-[11px] text-muted-foreground text-center space-y-1">
          <p className="font-medium">Legend</p>
          <p><span className="font-semibold">Limited</span>: Basic / partially available; missing automation.</p>
          <p><span className="font-semibold">Manual</span>: Achievable only through manual setup or formulas.</p>
          <p><span className="font-semibold">Varies</span>: Depends on provider tier or specific generic app.</p>
        </div>
      </div>
    </section>
  );
}
