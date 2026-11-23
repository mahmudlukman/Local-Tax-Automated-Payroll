import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  FileText,
  Search,
  AlertCircle,
  Calendar,
  Wallet,
  TrendingUp,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPeriod } from "../utils/formatDate";
import {
  useListPayslipsQuery,
  useLazyGetPayslipPdfQuery,
} from "../redux/features/payslip/payslipApi";

export default function MyPayslipsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const {
    data: payslips = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useListPayslipsQuery();

  const [fetchPayslipPdf] = useLazyGetPayslipPdfQuery();

  // Metrics summary
  const metrics = useMemo(() => {
    if (!payslips.length) return { ytdNet: 0, latestNet: 0, count: 0 };
    const ytdNet = payslips.reduce((acc, p) => acc + (p.netPay || 0), 0);
    const latestNet = payslips[0]?.netPay || 0;
    return { ytdNet, latestNet, count: payslips.length };
  }, [payslips]);

  // Filtered payslips
  const filteredPayslips = useMemo(() => {
    return payslips.filter((slip) => {
      const periodStr = formatPeriod(
        slip.period.month,
        slip.period.year,
      ).toLowerCase();
      return periodStr.includes(searchQuery.toLowerCase().trim());
    });
  }, [payslips, searchQuery]);

  async function handleDownloadPdf(payslipId: string, event: React.MouseEvent) {
    event.stopPropagation();
    setDownloadingId(payslipId);
    try {
      const blob = await fetchPayslipPdf(payslipId).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${payslipId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // surface error state if desired
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-6 text-neutral-900 antialiased">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-neutral-200/80 pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          My Payslips
        </h1>
        <p className="text-xs text-neutral-500">
          Access and download your digital payment statements, statutory tax
          records, and salary receipts.
        </p>
      </div>

      {/* KPI Overview Deck */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Latest Net Pay</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold font-mono text-neutral-900">
            {formatCurrency(metrics.latestNet)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Most recent payout
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">YTD Net Earnings</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold font-mono text-neutral-900">
            {formatCurrency(metrics.ytdNet)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Total received across {metrics.count} statements
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Total Records</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold font-mono text-neutral-900">
            {metrics.count}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Available for PDF download
          </div>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search period (e.g. October 2026)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs"
          />
        </div>
      </div>

      {/* Table Content Area */}
      {isLoading ? (
        <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white p-6 shadow-xs space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between pt-2">
              <div className="h-4 w-32 rounded bg-neutral-200 animate-pulse" />
              <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse" />
              <div className="h-4 w-16 rounded bg-neutral-200 animate-pulse" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200/80 bg-red-50/50 p-8 text-center shadow-2xs">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
          <h3 className="mt-3 text-sm font-semibold text-red-900">
            Failed to Load Payslips
          </h3>
          <p className="mt-1 text-xs text-red-700">
            {(error as { data?: { message?: string } })?.data?.message ??
              "There was an error loading your payment records."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-800 shadow-2xs hover:bg-red-50"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredPayslips.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-neutral-900">
            No Payslips Found
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            {searchQuery
              ? "No payment record matched your period query."
              : "You do not have any published payslips at this time."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-semibold">
                <th className="px-5 py-3">Pay Period</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Gross Pay</th>
                <th className="px-5 py-3 text-right">Net Take-Home</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filteredPayslips.map((payslip) => {
                const isDownloading = downloadingId === payslip._id;
                return (
                  <tr
                    key={payslip._id}
                    onClick={() => navigate(`/payslips/${payslip._id}`)}
                    className="group cursor-pointer transition-colors hover:bg-neutral-50/80"
                  >
                    <td className="px-5 py-3.5 font-semibold text-neutral-900">
                      {formatPeriod(payslip.period.month, payslip.period.year)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200/60">
                        <CheckCircle2 className="h-3 w-3" /> Processed
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-neutral-600">
                      {formatCurrency(payslip.netPay)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-neutral-900">
                      {formatCurrency(payslip.netPay)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        disabled={isDownloading}
                        onClick={(e) => handleDownloadPdf(payslip._id, e)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-60"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Fetching...
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5 text-neutral-500" />
                            PDF
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
