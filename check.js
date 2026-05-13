import { useState, useRef, useCallback, useMemo, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Copy, Trash2, Download, Zap, Square, Loader2, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProUpgradePopup } from "@/components/ProUpgradePopup";

const UsefulBins = lazy(() => import("@/components/UsefulBins").then(m => ({ default: m.UsefulBins })).catch(() => ({ default: () => <div className="rounded-2xl border border-border/50 bg-card/30 p-6 text-sm text-muted-foreground">Failed to load HOT BINs. Please refresh.</div> })));
const FakeAddressGenerator = lazy(() => import("@/components/FakeAddressGenerator").then(m => ({ default: m.FakeAddressGenerator })).catch(() => ({ default: () => <div className="rounded-2xl border border-border/50 bg-card/30 p-6 text-sm text-muted-foreground">Failed to load Address Generator. Please refresh.</div> })));

const SidebarFallback = () => (
  <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md p-6 animate-pulse">
    <div className="h-4 bg-muted/30 rounded w-1/2 mb-3" />
    <div className="h-3 bg-muted/20 rounded w-3/4" />
  </div>
);

interface CheckResult {
  card: string;
  code: number;
  status: string;
  message: string;
}

const Check = () => {
  const [bin, setBin] = useState("");
  const [month, setMonth] = useState("random");
  const [year, setYear] = useState("random");
  const [cvv, setCvv] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [results, setResults] = useState("");

  // Checker state
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [currentCard, setCurrentCard] = useState("");
  const [checkProgress, setCheckProgress] = useState({ checked: 0, total: 0 });
  const abortRef = useRef(false);
  const [countdown, setCountdown] = useState(0);

  const currentDate = useMemo(() => new Date(), []);
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const months = useMemo(() => ["random", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"], []);
  const years = useMemo(() => ["random", ...Array.from({ length: 10 }, (_, i) => String(currentYear + i))], [currentYear]);

  const generateLuhnNumber = useCallback((prefix: string, length: number): string => {
    const digits = prefix.split("").map(Number);
    while (digits.length < length - 1) {
      digits.push(Math.floor(Math.random() * 10));
    }
    let sum = 0;
    let isEven = true;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      if (isEven) { digit *= 2; if (digit > 9) digit -= 9; }
      sum += digit;
      isEven = !isEven;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return [...digits, checkDigit].join("");
  }, []);

  const generateCards = useCallback(() => {
    if (!bin || bin.length < 6) {
      toast.error("Enter a valid BIN (min 6 digits)");
      return;
    }
    const parsedQty = parseInt(quantity);
    const qty = Math.min(Math.max(isNaN(parsedQty) ? 10 : parsedQty, 1), 500);
    if (String(qty) !== quantity) setQuantity(String(qty));
    const cleanBin = bin.replace(/x/gi, () => String(Math.floor(Math.random() * 10)));
    const isAmex = cleanBin.startsWith("34") || cleanBin.startsWith("37");
    const cardLength = isAmex ? 15 : 16;
    const cards: string[] = [];
    for (let i = 0; i < qty; i++) {
      const resolvedBin = bin.replace(/x/gi, () => String(Math.floor(Math.random() * 10)));
      const cardNumber = generateLuhnNumber(resolvedBin, cardLength);
      let expYear: number;
      let expMonth: number;
      if (year === "random") { expYear = currentYear + Math.floor(Math.random() * 6); }
      else { expYear = parseInt(year); }
      if (month === "random") {
        if (expYear === currentYear) { expMonth = currentMonth + Math.floor(Math.random() * (13 - currentMonth)); }
        else { expMonth = 1 + Math.floor(Math.random() * 12); }
      } else {
        expMonth = parseInt(month);
        if (expYear === currentYear && expMonth < currentMonth) { expYear += 1; }
      }
      const cardCvv = cvv || (isAmex ? String(Math.floor(Math.random() * 9000) + 1000) : String(Math.floor(Math.random() * 900) + 100));
      cards.push(`${cardNumber}|${String(expMonth).padStart(2, "0")}|${expYear}|${cardCvv}`);
    }
    setResults(cards.join("\n"));
    toast.success(`Generated ${qty} cards`);

    supabase.rpc('log_bin_generation', {
      p_bin: bin.slice(0, 8),
      p_quantity: qty,
    }).then(() => {});
  }, [bin, month, year, cvv, quantity, currentYear, currentMonth, generateLuhnNumber]);

  const copyResults = useCallback(() => { if (!results) return; navigator.clipboard.writeText(results); toast.success("Copied all cards!"); }, [results]);
  const clearResults = useCallback(() => { setResults(""); }, []);
  const downloadResults = useCallback(() => {
    if (!results) return;
    const blob = new Blob([results], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `cc_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url); toast.success("Downloaded");
  }, [results]);

  const cardCount = useMemo(() => results ? results.split("\n").filter(Boolean).length : 0, [results]);

  // Sequential one-by-one checker (matches /live speed for stability)
  const checkOneCard = useCallback(async (card: string): Promise<CheckResult> => {
    try {
      const { data, error } = await supabase.functions.invoke("check-card", {
        body: { card: card.trim() },
      });
      if (error) throw error;
      return { card, code: data.code ?? 2, status: data.status ?? "Error", message: data.message ?? "Unknown" };
    } catch (err: any) {
      return { card, code: 2, status: "Error", message: err.message || "Request failed" };
    }
  }, []);

  const findLives = useCallback(async () => {
    const cards = results.split("\n").map(c => c.trim()).filter(Boolean);
    if (cards.length === 0) { toast.error("Generate cards first"); return; }
    if (cards.length > 100) { toast.error("Max 100 cards per check. Reduce quantity."); return; }

    setIsChecking(true);
    abortRef.current = false;
    setCheckProgress({ checked: 0, total: cards.length });
    setCheckResults([]);

    for (let i = 0; i < cards.length; i++) {
      if (abortRef.current) break;
      setCurrentCard(cards[i]);
      let result = await checkOneCard(cards[i]);
      if (result.status === "Error" && result.message?.toLowerCase().includes("rate limit")) {
        await new Promise(r => setTimeout(r, 5000));
        result = await checkOneCard(cards[i]);
      }
      setCheckResults(prev => [...prev, result]);
      setCheckProgress({ checked: i + 1, total: cards.length });
      if (i < cards.length - 1 && !abortRef.current) {
        for (let s = 3; s > 0; s--) {
          if (abortRef.current) break;
          setCountdown(s);
          await new Promise(r => setTimeout(r, 1000));
        }
        setCountdown(0);
      }
    }

    setIsChecking(false);
    setCurrentCard("");
    if (!abortRef.current) toast.success("Check complete!");
  }, [results, checkOneCard]);

  const stopChecking = useCallback(() => {
    abortRef.current = true;
    setIsChecking(false);
    setCurrentCard("");
    setCountdown(0);
    toast.info("Stopped");
  }, []);

  const liveCards = useMemo(() => checkResults.filter(r => r.code === 1), [checkResults]);
  const deadCount = useMemo(() => checkResults.filter(r => r.code === 0).length, [checkResults]);
  const unknownCount = useMemo(() => checkResults.filter(r => r.code !== 0 && r.code !== 1).length, [checkResults]);
  const checkProgressPct = checkProgress.total > 0 ? (checkProgress.checked / checkProgress.total) * 100 : 0;

  const copyLive = useCallback(() => {
    if (liveCards.length === 0) return;
    navigator.clipboard.writeText(liveCards.map(r => r.card).join("\n"));
    toast.success(`Copied ${liveCards.length} live cards`);
  }, [liveCards]);

  const exportLive = useCallback(() => {
    if (liveCards.length === 0) return;
    const blob = new Blob([liveCards.map(r => r.card).join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `live_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported live cards");
  }, [liveCards]);

  const clearCheckResults = useCallback(() => {
    setCheckResults([]);
    setCheckProgress({ checked: 0, total: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <ProUpgradePopup storageKey="pro-upgrade-popup-check" delayMs={6000} />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/3 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <CreditCard className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">CC Generator</h1>
            <p className="text-sm text-muted-foreground">Luhn-valid test cards</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Generator Panel */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">BIN Number</Label>
                <Input placeholder="424242" value={bin} onChange={(e) => setBin(e.target.value.replace(/[^0-9x]/gi, "").slice(0, 16))} className="h-12 bg-background border-border/50 font-mono text-lg tracking-wider placeholder:text-muted-foreground/40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Month</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="h-12 bg-background border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>{months.map((m) => (<SelectItem key={m} value={m}>{m === "random" ? "Random" : m}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Year</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="h-12 bg-background border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>{years.map((y) => (<SelectItem key={y} value={y}>{y === "random" ? "Random" : y}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">CVV</Label>
                  <Input placeholder="Random" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} className="h-12 bg-background border-border/50 font-mono tracking-wider placeholder:text-muted-foreground/40" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Quantity</Label>
                  <Input type="number" min="1" max="500" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-12 bg-background border-border/50 font-mono" />
                </div>
              </div>
              <Button onClick={generateCards} className="w-full h-14 bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 text-primary-foreground font-bold text-base rounded-xl shadow-xl shadow-primary/20 transition-all duration-300 hover:shadow-primary/40 hover:scale-[1.02]">
                <Zap className="w-5 h-5 mr-2" />Generate Cards
              </Button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">Output</span>
                  {cardCount > 0 && <span className="px-2.5 py-1 text-xs font-bold bg-primary/15 text-primary rounded-lg">{cardCount} cards</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={copyResults} disabled={!results} className="h-9 px-4 gap-2 text-sm font-medium hover:bg-primary/10 hover:text-primary disabled:opacity-30"><Copy className="w-4 h-4" />Copy</Button>
                  <Button variant="ghost" size="sm" onClick={downloadResults} disabled={!results} className="h-9 px-4 gap-2 text-sm font-medium hover:bg-accent/10 hover:text-accent disabled:opacity-30"><Download className="w-4 h-4" />Export</Button>
                  <div className="w-px h-5 bg-border/50" />
                  <Button variant="ghost" size="sm" onClick={clearResults} disabled={!results} className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="p-4">
                <Textarea value={results} onChange={(e) => setResults(e.target.value)} placeholder="Generated cards will appear here..." className="min-h-[200px] max-h-[280px] bg-background/80 border-border/30 font-mono text-sm resize-none" readOnly={false} />
              </div>

              {/* Find Live Button */}
              <div className="px-4 pb-4">
                {!isChecking ? (
                  <Button
                    onClick={findLives}
                    disabled={!results}
                    className="w-full h-12 gap-2 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg"
                  >
                    <Search className="w-4 h-4" />Find Live
                  </Button>
                ) : (
                  <Button
                    onClick={stopChecking}
                    variant="destructive"
                    className="w-full h-12 gap-2 rounded-xl font-bold text-sm"
                  >
                    <Square className="w-4 h-4" />Stop Checking
                  </Button>
                )}
              </div>

              {/* Progress */}
              {(isChecking || checkProgress.total > 0) && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                      {isChecking && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                      {isChecking ? "Checking..." : "Complete"}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">{checkProgress.checked}/{checkProgress.total}</span>
                  </div>
                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${checkProgressPct}%`,
                        background: checkProgressPct === 100
                          ? "hsl(var(--primary))"
                          : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))",
                      }}
                    />
                  </div>
                  {currentCard && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono bg-muted/10 rounded-md px-2 py-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin shrink-0" />
                      <span className="truncate flex-1">{currentCard}</span>
                      {countdown > 0 && (
                        <span className="shrink-0 ml-auto text-[10px] font-bold text-primary tabular-nums">
                          {countdown}s
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Check Results - Full Width */}
          {checkResults.length > 0 && (
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Check Results</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-green-500/10 text-green-500 border border-green-500/20">{liveCards.length} Live</span>
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">{deadCount} Die</span>
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">{unknownCount} Unknown</span>
                    </div>
                  </div>
                </div>

                {/* Live Cards Section */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Live Cards</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={copyLive} disabled={liveCards.length === 0}
                        className="h-7 gap-1 text-[11px] rounded-md disabled:opacity-20 hover:bg-primary/10 hover:text-primary px-2">
                        <Copy className="w-3 h-3" />Copy
                      </Button>
                      <Button variant="ghost" size="sm" onClick={exportLive} disabled={liveCards.length === 0}
                        className="h-7 gap-1 text-[11px] rounded-md disabled:opacity-20 hover:bg-primary/10 hover:text-primary px-2">
                        <Download className="w-3 h-3" />Export
                      </Button>
                      <div className="w-px h-3.5 bg-border/40" />
                      <Button variant="ghost" size="sm" onClick={clearCheckResults} disabled={checkResults.length === 0}
                        className="h-7 w-7 p-0 rounded-md disabled:opacity-20 hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {liveCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/40">
                      <CheckCircle2 className="w-8 h-8 mb-2" />
                      <p className="text-xs font-medium text-muted-foreground/60">No live cards yet</p>
                      <p className="text-[10px] mt-0.5">Run "Find Live" to check cards</p>
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                      {liveCards.map((r, i) => (
                        <div key={i}
                          className="group rounded-lg bg-green-500/[0.04] border border-green-500/10 hover:border-green-500/25 px-3 py-2 font-mono text-[11px] text-foreground flex items-center gap-2 transition-colors duration-200">
                          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 shadow-sm shadow-green-500/50" />
                          <span className="truncate flex-1">{r.card}</span>
                          <span className="text-[9px] text-green-400/70 shrink-0">Charged ✓ [MaDLeeTs]</span>
                          <button
                            onClick={() => { navigator.clipboard.writeText(r.card); toast.success("Copied"); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          <div className="lg:col-span-5 grid md:grid-cols-2 gap-6">
            <Suspense fallback={<SidebarFallback />}>
              <UsefulBins />
            </Suspense>
            <Suspense fallback={<SidebarFallback />}>
              <FakeAddressGenerator />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Check;
