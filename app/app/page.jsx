"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const KEY = "tradequote:data:v1";
const ACCENTS = ["#1F6FEB", "#0E7C66", "#C2410C", "#7C3AED", "#B91C1C", "#0F766E"];
const STATUSES = {
  draft: { label: "Draft", color: "#6B7280", bg: "#F3F4F6" },
  sent: { label: "Sent", color: "#B45309", bg: "#FEF3C7" },
  accepted: { label: "Accepted", color: "#047857", bg: "#D1FAE5" },
  paid: { label: "Paid", color: "#047857", bg: "#D1FAE5" },
  declined: { label: "Declined", color: "#B91C1C", bg: "#FEE2E2" },
};

const DEFAULT_SETTINGS = {
  bizName: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  taxRate: 0,
  taxLabel: "Tax",
  currency: "$",
  terms: "Payment due within 14 days of invoice date.",
  accent: "#1F6FEB",
};

const blankDoc = (type, counters, settings) => ({
  id: Date.now().toString(),
  type,
  number:
    (type === "quote" ? "Q-" : "INV-") +
    String((counters[type] || 0) + 1).padStart(4, "0"),
  clientName: "",
  clientEmail: "",
  clientAddress: "",
  date: new Date().toISOString().slice(0, 10),
  items: [{ id: "i" + Date.now(), desc: "", qty: 1, rate: 0 }],
  notes: "",
  taxRate: settings.taxRate,
  status: "draft",
});

export default function TradeQuote() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [docs, setDocs] = useState([]);
  const [clients, setClients] = useState([]);
  const [counters, setCounters] = useState({ quote: 0, invoice: 0 });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setSettings({ ...DEFAULT_SETTINGS, ...(d.settings || {}) });
        setDocs(d.docs || []);
        setClients(d.clients || []);
        setCounters(d.counters || { quote: 0, invoice: 0 });
        if (!d.settings || !d.settings.bizName) setView("settings");
      } else {
        setView("settings");
      }
    } catch {
      setView("settings");
    } finally {
      setLoaded(true);
    }
  }, []);

  const persist = useCallback((s, d, c, cl) => {
    setSaving(true);
    try {
      localStorage.setItem(KEY, JSON.stringify({ settings: s, docs: d, counters: c, clients: cl }));
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setSaving(false), 400);
    }
  }, []);

  useEffect(() => {
    if (loaded) persist(settings, docs, counters, clients);
  }, [settings, docs, counters, clients, loaded, persist]);

  const accent = settings.accent || "#1F6FEB";
  const cur = settings.currency || "$";
  const money = (n) => cur + (Number(n) || 0).toFixed(2);

  const totalsOf = (doc) => {
    const sub = doc.items.reduce((a, it) => a + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
    const tax = sub * (Number(doc.taxRate) || 0) / 100;
    return { sub, tax, total: sub + tax };
  };

  const stats = useMemo(() => {
    let outstanding = 0, won = 0;
    docs.forEach((d) => {
      const { total } = totalsOf(d);
      if (d.status === "sent") outstanding += total;
      if (d.status === "accepted" || d.status === "paid") won += total;
    });
    return { outstanding, won, count: docs.length };
  }, [docs]);

  const newDoc = (type) => {
    setEditing(blankDoc(type, counters, settings));
    setView("edit");
  };

  const editDoc = (doc) => {
    setEditing(JSON.parse(JSON.stringify(doc)));
    setView("edit");
  };

  const upsertClient = (e) => {
    const name = e.clientName.trim();
    if (!name) return;
    const idx = clients.findIndex((c) => c.name.toLowerCase() === name.toLowerCase());
    const record = { name, email: e.clientEmail || "", address: e.clientAddress || "" };
    if (idx === -1) setClients([record, ...clients]);
    else setClients(clients.map((c, i) => (i === idx ? record : c)));
  };

  const saveDoc = () => {
    const e = editing;
    if (!e.clientName.trim()) { alert("Add a client name first."); return; }
    const exists = docs.some((d) => d.id === e.id);
    if (exists) {
      setDocs(docs.map((d) => (d.id === e.id ? e : d)));
    } else {
      setDocs([e, ...docs]);
      setCounters({ ...counters, [e.type]: (counters[e.type] || 0) + 1 });
    }
    upsertClient(e);
    setView("list");
    setEditing(null);
  };

  const duplicateDoc = (doc) => {
    const copy = {
      ...JSON.parse(JSON.stringify(doc)),
      id: Date.now().toString(),
      number: (doc.type === "quote" ? "Q-" : "INV-") + String((counters[doc.type] || 0) + 1).padStart(4, "0"),
      date: new Date().toISOString().slice(0, 10),
      status: "draft",
      items: doc.items.map((it) => ({ ...it, id: "i" + Date.now() + Math.random() })),
    };
    setEditing(copy);
    setView("edit");
  };

  const applyClient = (c) =>
    setEditing((e) => ({ ...e, clientName: c.name, clientEmail: c.email, clientAddress: c.address }));

  const deleteDoc = (id) => {
    if (!window.confirm("Delete this document?")) return;
    setDocs(docs.filter((d) => d.id !== id));
    setView("list");
  };

  const setStatus = (doc, status) =>
    setDocs(docs.map((d) => (d.id === doc.id ? { ...d, status } : d)));

  const updItem = (i, field, val) => {
    const items = editing.items.map((it, idx) => (idx === i ? { ...it, [field]: val } : it));
    setEditing({ ...editing, items });
  };
  const addItem = () =>
    setEditing({ ...editing, items: [...editing.items, { id: "i" + Date.now(), desc: "", qty: 1, rate: 0 }] });
  const rmItem = (i) =>
    setEditing({ ...editing, items: editing.items.filter((_, idx) => idx !== i) });

  if (!loaded) return <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading…</div>;

  return (
    <div style={wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input, textarea, select, button { font-family: inherit; }
        input:focus, textarea:focus, select:focus { outline: 2px solid ${accent}40; border-color: ${accent}; }
        .row:hover { background: #FAFAFA; }
        @media print {
          .no-print { display: none !important; }
          .sheet { box-shadow: none !important; border: none !important; margin: 0 !important; max-width: 100% !important; }
          body { background: #fff !important; }
        }
      `}</style>

      {view !== "preview" && (
        <div className="no-print" style={topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...logoDot, background: accent }}>
              {(settings.bizName || "?").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: brand, fontWeight: 800, fontSize: 17, lineHeight: 1 }}>
                {settings.bizName || "Your Business"}
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                {saving ? "saving…" : "all changes saved"}
              </div>
            </div>
          </div>
          <button className="no-print" onClick={() => setView("settings")} style={iconBtn} title="Settings">⚙</button>
        </div>
      )}

      {view === "settings" && (
        <div style={pad}>
          <h2 style={pageTitle}>Business details</h2>
          <p style={subtle}>This appears on every quote and invoice you send.</p>
          {[
            ["bizName", "Business name", "e.g. Bright Spark Electrical"],
            ["ownerName", "Your name", "e.g. Jordan Lee"],
            ["email", "Email", "you@business.com"],
            ["phone", "Phone", "(555) 123-4567"],
            ["address", "Address", "123 Trade St, City"],
          ].map(([k, label, ph]) => (
            <Field key={k} label={label}>
              <input value={settings[k]} placeholder={ph}
                onChange={(e) => setSettings({ ...settings, [k]: e.target.value })} style={input} />
            </Field>
          ))}
          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Currency" style={{ flex: 1 }}>
              <input value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} style={input} />
            </Field>
            <Field label="Tax label" style={{ flex: 2 }}>
              <input value={settings.taxLabel} placeholder="Tax / VAT / GST"
                onChange={(e) => setSettings({ ...settings, taxLabel: e.target.value })} style={input} />
            </Field>
            <Field label="Tax %" style={{ flex: 1 }}>
              <input value={settings.taxRate} inputMode="decimal"
                onChange={(e) => setSettings({ ...settings, taxRate: e.target.value.replace(/[^0-9.]/g, "") })} style={input} />
            </Field>
          </div>
          <Field label="Default payment terms">
            <textarea value={settings.terms} rows={2}
              onChange={(e) => setSettings({ ...settings, terms: e.target.value })} style={{ ...input, resize: "vertical" }} />
          </Field>
          <Field label="Accent color">
            <div style={{ display: "flex", gap: 8 }}>
              {ACCENTS.map((c) => (
                <button key={c} onClick={() => setSettings({ ...settings, accent: c })}
                  style={{ width: 32, height: 32, borderRadius: 8, background: c, border: settings.accent === c ? "3px solid #111" : "3px solid transparent", cursor: "pointer" }} />
              ))}
            </div>
          </Field>
          <button onClick={() => setView("list")} style={{ ...primaryBtn, background: accent, marginTop: 8 }}>
            {settings.bizName ? "Done" : "Save & continue"}
          </button>
        </div>
      )}

      {view === "list" && (
        <div style={pad}>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <Stat label="Outstanding" value={money(stats.outstanding)} hint="awaiting payment" accent="#B45309" />
            <Stat label="Won" value={money(stats.won)} hint="accepted / paid" accent="#047857" />
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
            <button onClick={() => newDoc("quote")} style={{ ...primaryBtn, background: accent, flex: 1 }}>+ New quote</button>
            <button onClick={() => newDoc("invoice")} style={{ ...outlineBtn, borderColor: accent, color: accent, flex: 1 }}>+ New invoice</button>
          </div>
          {docs.length === 0 ? (
            <div style={empty}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>🧾</div>
              No documents yet.<br />Create your first quote above.
            </div>
          ) : (
            <div>
              <div style={{ ...subtle, marginBottom: 8 }}>{docs.length} document{docs.length !== 1 ? "s" : ""}</div>
              {docs.map((d) => {
                const { total } = totalsOf(d);
                const st = STATUSES[d.status] || STATUSES.draft;
                return (
                  <div key={d.id} className="row" style={listRow} onClick={() => editDoc(d)}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "#9CA3AF" }}>{d.number}</span>
                        <span style={{ ...badge, color: st.color, background: st.bg }}>{st.label}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {d.clientName || "Untitled"}
                      </div>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>{d.type === "quote" ? "Quote" : "Invoice"} · {d.date}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{money(total)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === "edit" && editing && (
        <div style={pad}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <button onClick={() => { setView("list"); setEditing(null); }} style={backBtn}>← Back</button>
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#9CA3AF" }}>{editing.number}</span>
          </div>
          <h2 style={pageTitle}>{editing.type === "quote" ? "Quote" : "Invoice"} for…</h2>

          {clients.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...sectionLabel, marginBottom: 6 }}>Saved clients</div>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {clients.map((c) => (
                  <button key={c.name} onClick={() => applyClient(c)}
                    style={{ ...chip, whiteSpace: "nowrap", flexShrink: 0,
                      ...(editing.clientName.toLowerCase() === c.name.toLowerCase()
                        ? { background: accent + "15", color: accent, borderColor: accent } : {}) }}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Field label="Client name">
            <input value={editing.clientName} placeholder="e.g. Sarah Thompson"
              onChange={(e) => setEditing({ ...editing, clientName: e.target.value })} style={input} />
          </Field>
          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Client email" style={{ flex: 1 }}>
              <input value={editing.clientEmail} onChange={(e) => setEditing({ ...editing, clientEmail: e.target.value })} style={input} />
            </Field>
            <Field label="Date" style={{ flex: 1 }}>
              <input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} style={input} />
            </Field>
          </div>
          <Field label="Job address (optional)">
            <input value={editing.clientAddress} onChange={(e) => setEditing({ ...editing, clientAddress: e.target.value })} style={input} />
          </Field>

          <div style={{ ...sectionLabel, marginTop: 18 }}>Line items</div>
          {editing.items.map((it, i) => (
            <div key={it.id} style={itemCard}>
              <input value={it.desc} placeholder="Description of work / materials"
                onChange={(e) => updItem(i, "desc", e.target.value)} style={{ ...input, marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input value={it.qty} inputMode="decimal" placeholder="Qty"
                  onChange={(e) => updItem(i, "qty", e.target.value.replace(/[^0-9.]/g, ""))}
                  style={{ ...input, width: 64, textAlign: "center" }} />
                <span style={{ color: "#9CA3AF" }}>×</span>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={curPrefix}>{cur}</span>
                  <input value={it.rate} inputMode="decimal" placeholder="Rate"
                    onChange={(e) => updItem(i, "rate", e.target.value.replace(/[^0-9.]/g, ""))}
                    style={{ ...input, paddingLeft: 24 }} />
                </div>
                <span style={{ width: 78, textAlign: "right", fontWeight: 600 }}>
                  {money((Number(it.qty) || 0) * (Number(it.rate) || 0))}
                </span>
                {editing.items.length > 1 && (
                  <button onClick={() => rmItem(i)} style={delBtn}>×</button>
                )}
              </div>
            </div>
          ))}
          <button onClick={addItem} style={{ ...outlineBtn, borderColor: "#D1D5DB", color: "#374151", width: "100%", marginTop: 4 }}>
            + Add line
          </button>

          <div style={totalsBox}>
            {(() => { const t = totalsOf(editing); return (
              <>
                <Row k="Subtotal" v={money(t.sub)} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 14 }}>
                    {settings.taxLabel}
                    <input value={editing.taxRate} inputMode="decimal"
                      onChange={(e) => setEditing({ ...editing, taxRate: e.target.value.replace(/[^0-9.]/g, "") })}
                      style={{ ...input, width: 50, padding: "4px 6px", textAlign: "center" }} />%
                  </span>
                  <span>{money(t.tax)}</span>
                </div>
                <div style={{ height: 1, background: "#E5E7EB", margin: "6px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18 }}>
                  <span>Total</span><span style={{ color: accent }}>{money(t.total)}</span>
                </div>
              </>
            ); })()}
          </div>

          <Field label="Notes (optional)" style={{ marginTop: 16 }}>
            <textarea value={editing.notes} rows={2} placeholder="Anything the client should know…"
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })} style={{ ...input, resize: "vertical" }} />
          </Field>

          <div style={{ ...sectionLabel, marginTop: 14 }}>Status</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
            {(editing.type === "quote"
              ? ["draft", "sent", "accepted", "declined"]
              : ["draft", "sent", "paid"]
            ).map((s) => (
              <button key={s} onClick={() => setEditing({ ...editing, status: s })}
                style={{ ...chip, ...(editing.status === s ? { background: STATUSES[s].bg, color: STATUSES[s].color, borderColor: STATUSES[s].color } : {}) }}>
                {STATUSES[s].label}
              </button>
            ))}
          </div>

          {docs.some((d) => d.id === editing.id) && (
            <button onClick={() => duplicateDoc(editing)}
              style={{ ...outlineBtn, borderColor: "#D1D5DB", color: "#374151", width: "100%", marginBottom: 10 }}>
              ⧉ Duplicate this {editing.type}
            </button>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => deleteDoc(editing.id)} style={{ ...outlineBtn, borderColor: "#FCA5A5", color: "#DC2626" }}>Delete</button>
            <button onClick={saveDoc} style={{ ...outlineBtn, borderColor: accent, color: accent, flex: 1 }}>Save</button>
            <button onClick={() => { saveDoc(); setEditing(editing); setView("preview"); }} style={{ ...primaryBtn, background: accent, flex: 1 }}>
              Preview / PDF
            </button>
          </div>
        </div>
      )}

      {view === "preview" && editing && (
        <div>
          <div className="no-print" style={{ ...topbar, justifyContent: "space-between" }}>
            <button onClick={() => setView("edit")} style={backBtn}>← Edit</button>
            <button onClick={() => window.print()} style={{ ...primaryBtn, background: accent, width: "auto", padding: "10px 18px" }}>
              ⬇ Save as PDF
            </button>
          </div>
          <DocumentSheet doc={editing} settings={settings} accent={accent} money={money} totalsOf={totalsOf} brand={brand} />
          <p className="no-print" style={{ textAlign: "center", color: "#9CA3AF", fontSize: 12, padding: "8px 20px 24px" }}>
            Tip: in the print dialog, choose "Save as PDF" as the destination.
          </p>
        </div>
      )}
    </div>
  );
}

function DocumentSheet({ doc, settings, accent, money, totalsOf, brand }) {
  const t = totalsOf(doc);
  const title = doc.type === "quote" ? "QUOTE" : "INVOICE";
  return (
    <div className="sheet" style={sheet}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: brand, fontWeight: 800, fontSize: 22, color: "#111" }}>{settings.bizName || "Your Business"}</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4, lineHeight: 1.5 }}>
            {settings.ownerName && <div>{settings.ownerName}</div>}
            {settings.address && <div>{settings.address}</div>}
            {settings.phone && <div>{settings.phone}</div>}
            {settings.email && <div>{settings.email}</div>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: brand, fontWeight: 800, fontSize: 26, letterSpacing: "0.05em", color: accent }}>{title}</div>
          <div style={{ fontFamily: "monospace", fontSize: 13, color: "#374151", marginTop: 4 }}>{doc.number}</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{doc.date}</div>
        </div>
      </div>

      <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px 16px", marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 4 }}>
          {doc.type === "quote" ? "Prepared for" : "Bill to"}
        </div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{doc.clientName}</div>
        {doc.clientEmail && <div style={{ fontSize: 12, color: "#6B7280" }}>{doc.clientEmail}</div>}
        {doc.clientAddress && <div style={{ fontSize: 12, color: "#6B7280" }}>{doc.clientAddress}</div>}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${accent}` }}>
            <th style={th}>Description</th>
            <th style={{ ...th, textAlign: "center", width: 50 }}>Qty</th>
            <th style={{ ...th, textAlign: "right", width: 80 }}>Rate</th>
            <th style={{ ...th, textAlign: "right", width: 90 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {doc.items.filter((it) => it.desc || it.rate).map((it) => (
            <tr key={it.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
              <td style={td}>{it.desc || "—"}</td>
              <td style={{ ...td, textAlign: "center" }}>{it.qty}</td>
              <td style={{ ...td, textAlign: "right" }}>{money(it.rate)}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{money((Number(it.qty) || 0) * (Number(it.rate) || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
        <div style={{ width: 240 }}>
          <Row k="Subtotal" v={money(t.sub)} />
          <Row k={`${settings.taxLabel} (${doc.taxRate || 0}%)`} v={money(t.tax)} />
          <div style={{ height: 2, background: "#111", margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18 }}>
            <span>Total</span><span style={{ color: accent }}>{money(t.total)}</span>
          </div>
        </div>
      </div>

      {doc.notes && (
        <div style={{ marginBottom: 18 }}>
          <div style={noteLabel}>Notes</div>
          <div style={{ fontSize: 13, color: "#374151", whiteSpace: "pre-wrap" }}>{doc.notes}</div>
        </div>
      )}
      {settings.terms && (
        <div>
          <div style={noteLabel}>Terms</div>
          <div style={{ fontSize: 12, color: "#6B7280", whiteSpace: "pre-wrap" }}>{settings.terms}</div>
        </div>
      )}
      <div style={{ textAlign: "center", marginTop: 36, fontSize: 11, color: "#9CA3AF" }}>
        Thank you for your business.
      </div>
    </div>
  );
}

const Field = ({ label, children, style }) => (
  <div style={{ marginBottom: 14, ...style }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);
const Row = ({ k, v }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 14, color: "#374151" }}>
    <span>{k}</span><span>{v}</span>
  </div>
);
const Stat = ({ label, value, hint, accent }) => (
  <div style={{ flex: 1, background: "#fff", border: "1px solid #EEF0F2", borderRadius: 14, padding: "14px 16px" }}>
    <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color: accent, margin: "4px 0 1px" }}>{value}</div>
    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{hint}</div>
  </div>
);

const brand = "'Bricolage Grotesque', sans-serif";
const wrap = { fontFamily: "'Hanken Grotesk', system-ui, sans-serif", background: "#F4F5F7", minHeight: "100vh", color: "#111827", maxWidth: 560, margin: "0 auto" };
const topbar = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#fff", borderBottom: "1px solid #EEF0F2", position: "sticky", top: 0, zIndex: 10 };
const logoDot = { width: 36, height: 36, borderRadius: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18 };
const pad = { padding: "18px" };
const pageTitle = { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, margin: "0 0 4px" };
const subtle = { fontSize: 13, color: "#9CA3AF", margin: "0 0 18px" };
const sectionLabel = { fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" };
const input = { width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14, background: "#fff", color: "#111827" };
const primaryBtn = { width: "100%", color: "#fff", border: "none", borderRadius: 11, padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer" };
const outlineBtn = { background: "#fff", border: "1.5px solid", borderRadius: 11, padding: "12px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const iconBtn = { background: "#F3F4F6", border: "none", borderRadius: 9, width: 38, height: 38, fontSize: 18, cursor: "pointer" };
const backBtn = { background: "none", border: "none", color: "#6B7280", fontSize: 14, cursor: "pointer", padding: 0, fontWeight: 600 };
const listRow = { display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: "#fff", border: "1px solid #EEF0F2", borderRadius: 12, marginBottom: 8, cursor: "pointer" };
const badge = { fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, letterSpacing: "0.03em" };
const empty = { textAlign: "center", color: "#9CA3AF", fontSize: 14, padding: "50px 20px", lineHeight: 1.6 };
const itemCard = { background: "#fff", border: "1px solid #EEF0F2", borderRadius: 12, padding: "12px", marginBottom: 8 };
const curPrefix = { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 14 };
const delBtn = { background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, width: 30, height: 30, fontSize: 18, cursor: "pointer", flexShrink: 0 };
const totalsBox = { background: "#fff", border: "1px solid #EEF0F2", borderRadius: 12, padding: "12px 16px", marginTop: 12 };
const chip = { background: "#fff", border: "1.5px solid #E5E7EB", color: "#6B7280", borderRadius: 20, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const sheet = { background: "#fff", maxWidth: 520, margin: "16px", padding: "32px 28px", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,.08)", fontFamily: "'Hanken Grotesk', system-ui, sans-serif" };
const th = { textAlign: "left", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9CA3AF", padding: "0 0 8px", fontWeight: 700 };
const td = { fontSize: 13, color: "#1F2937", padding: "10px 0", verticalAlign: "top" };
const noteLabel = { fontSize: 10, letterSpacing: "0.12em", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 4 };
