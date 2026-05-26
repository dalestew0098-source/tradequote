"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const KEY = "tradequote:data:v2";
const ACCENTS = ["#E8440A", "#1F6FEB", "#0E7C66", "#7C3AED", "#B91C1C", "#0F766E"];
const STATUSES = {
  draft: { label: "Draft", color: "#6B7280", bg: "#F3F4F6" },
  sent: { label: "Sent", color: "#B45309", bg: "#FEF3C7" },
  accepted: { label: "Accepted", color: "#047857", bg: "#D1FAE5" },
  paid: { label: "Paid", color: "#047857", bg: "#D1FAE5" },
  declined: { label: "Declined", color: "#B91C1C", bg: "#FEE2E2" },
  active: { label: "Active", color: "#047857", bg: "#D1FAE5" },
  expired: { label: "Expired", color: "#B91C1C", bg: "#FEE2E2" },
};

const DEFAULT_SETTINGS = {
  bizName: "", ownerName: "", email: "", phone: "", address: "",
  taxRate: 0, taxLabel: "Tax", currency: "$",
  terms: "Payment due within 14 days of invoice date.",
  accent: "#E8440A", defaultMarkup: 30,
};

const HVAC_TEMPLATES = [
  { label: "AC Install", items: [
    { desc: "AC Unit Supply & Installation", qty: 1, cost: 2200, markup: 30, isMaterial: true },
    { desc: "Labour – Installation (4hrs)", qty: 4, cost: 95, markup: 0, isMaterial: false },
    { desc: "Refrigerant Charge", qty: 1, cost: 80, markup: 25, isMaterial: true },
  ]},
  { label: "Furnace Replace", items: [
    { desc: "Furnace Unit Supply & Install", qty: 1, cost: 1800, markup: 30, isMaterial: true },
    { desc: "Labour – Installation (5hrs)", qty: 5, cost: 95, markup: 0, isMaterial: false },
    { desc: "Flue Pipe & Fittings", qty: 1, cost: 120, markup: 25, isMaterial: true },
  ]},
  { label: "Service Call", items: [
    { desc: "Diagnostic / Service Call Fee", qty: 1, cost: 85, markup: 0, isMaterial: false },
    { desc: "Labour (1hr)", qty: 1, cost: 95, markup: 0, isMaterial: false },
  ]},
  { label: "Annual Tune-Up", items: [
    { desc: "HVAC Annual Tune-Up & Inspection", qty: 1, cost: 120, markup: 0, isMaterial: false },
    { desc: "Filter Replacement", qty: 1, cost: 18, markup: 30, isMaterial: true },
  ]},
];

const blankContract = (counters) => ({
  id: Date.now().toString(), type: "contract",
  number: "SVC-" + String((counters.contract || 0) + 1).padStart(4, "0"),
  clientName: "", clientEmail: "", clientAddress: "",
  date: new Date().toISOString().slice(0, 10),
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
  price: "", billingCycle: "annual",
  services: ["2× annual tune-up & inspection","Priority scheduling for service calls","10% discount on parts and labour","Filter replacement included"],
  equipment: "", notes: "", status: "draft",
});

const blankDoc = (type, counters, settings) => ({
  id: Date.now().toString(), type,
  number: (type === "quote" ? "Q-" : "INV-") + String((counters[type] || 0) + 1).padStart(4, "0"),
  clientName: "", clientEmail: "", clientAddress: "",
  date: new Date().toISOString().slice(0, 10),
  items: [{ id: "i" + Date.now(), desc: "", qty: 1, cost: "", markup: settings.defaultMarkup || 30, isMaterial: false }],
  notes: "", taxRate: settings.taxRate, status: "draft",
});

const itemRate = (it) => {
  if (it.isMaterial && it.cost !== "" && it.cost !== undefined)
    return Number(it.cost) * (1 + (Number(it.markup) || 0) / 100);
  return Number(it.rate ?? it.cost ?? 0);
};

export default function TradeQuote() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [docs, setDocs] = useState([]);
  const [clients, setClients] = useState([]);
  const [counters, setCounters] = useState({ quote: 0, invoice: 0, contract: 0 });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);
  const [markupMode, setMarkupMode] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage?.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setSettings({ ...DEFAULT_SETTINGS, ...(d.settings || {}) });
        setDocs(d.docs || []);
        setClients(d.clients || []);
        setCounters(d.counters || { quote: 0, invoice: 0, contract: 0 });
        if (!d.settings?.bizName) setView("settings");
      } else { setView("settings"); }
    } catch { setView("settings"); }
    finally { setLoaded(true); }
  }, []);

  const persist = useCallback((s, d, c, cl) => {
    setSaving(true);
    try { window.localStorage?.setItem(KEY, JSON.stringify({ settings: s, docs: d, counters: c, clients: cl })); }
    catch (e) { console.error(e); }
    finally { setTimeout(() => setSaving(false), 400); }
  }, []);

  useEffect(() => { if (loaded) persist(settings, docs, counters, clients); },
    [settings, docs, counters, clients, loaded, persist]);

  const accent = settings.accent || "#E8440A";
  const cur = settings.currency || "$";
  const money = (n) => cur + (Number(n) || 0).toFixed(2);

  const totalsOf = (doc) => {
    if (doc.type === "contract") { const p = Number(doc.price)||0; return { sub:p, tax:0, total:p }; }
    const sub = doc.items.reduce((a,it) => a + (Number(it.qty)||0) * itemRate(it), 0);
    const tax = sub * (Number(doc.taxRate)||0) / 100;
    return { sub, tax, total: sub+tax };
  };

  const stats = useMemo(() => {
    let outstanding = 0, won = 0;
    docs.forEach(d => {
      const { total } = totalsOf(d);
      if (d.status === "sent") outstanding += total;
      if (["accepted","paid","active"].includes(d.status)) won += total;
    });
    return { outstanding, won };
  }, [docs]);

  const newDoc = (type) => { setEditing(type === "contract" ? blankContract(counters) : blankDoc(type, counters, settings)); setView("edit"); };
  const editDoc = (doc) => { setEditing(JSON.parse(JSON.stringify(doc))); setView("edit"); };

  const upsertClient = (e) => {
    const name = e.clientName?.trim(); if (!name) return;
    const record = { name, email: e.clientEmail||"", address: e.clientAddress||"" };
    const idx = clients.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    if (idx===-1) setClients([record,...clients]);
    else setClients(clients.map((c,i) => i===idx ? record : c));
  };

  const saveDoc = () => {
    if (!editing.clientName?.trim()) { alert("Add a client name first."); return; }
    const exists = docs.some(d => d.id === editing.id);
    if (exists) { setDocs(docs.map(d => d.id===editing.id ? editing : d)); }
    else { setDocs([editing,...docs]); setCounters({...counters,[editing.type]:(counters[editing.type]||0)+1}); }
    upsertClient(editing); setView("list"); setEditing(null);
  };

  const duplicateDoc = (doc) => {
    const type = doc.type;
    const prefix = type==="quote"?"Q-":type==="invoice"?"INV-":"SVC-";
    const copy = { ...JSON.parse(JSON.stringify(doc)), id: Date.now().toString(),
      number: prefix+String((counters[type]||0)+1).padStart(4,"0"),
      date: new Date().toISOString().slice(0,10), status:"draft",
      items: doc.items?.map(it => ({...it, id:"i"+Date.now()+Math.random()})),
    };
    setEditing(copy); setView("edit");
  };

  const applyClient = (c) => setEditing(e => ({...e, clientName:c.name, clientEmail:c.email, clientAddress:c.address}));

  const applyTemplate = (tpl) => {
    const items = tpl.items.map(it => ({ id:"i"+Date.now()+Math.random(), desc:it.desc, qty:it.qty, cost:it.cost, markup:it.markup, isMaterial:it.isMaterial }));
    setEditing(e => ({...e, items})); setMarkupMode(true);
  };

  const deleteDoc = (id) => { if (!window.confirm("Delete?")) return; setDocs(docs.filter(d=>d.id!==id)); setView("list"); };
  const updItem = (i,field,val) => setEditing({...editing, items:editing.items.map((it,idx)=>idx===i?{...it,[field]:val}:it)});
  const addItem = () => setEditing({...editing, items:[...editing.items,{id:"i"+Date.now(),desc:"",qty:1,cost:"",markup:settings.defaultMarkup||30,isMaterial:false}]});
  const rmItem = (i) => setEditing({...editing, items:editing.items.filter((_,idx)=>idx!==i)});

  if (!loaded) return <div style={{...wrap,display:"flex",alignItems:"center",justifyContent:"center"}}>Loading…</div>;
  const isContract = editing?.type==="contract";

  return (
    <div style={wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        input,textarea,select,button{font-family:inherit;}
        input:focus,textarea:focus,select:focus{outline:2px solid ${accent}40;border-color:${accent};}
        .row:hover{background:#FAFAFA;}
        @media print{.no-print{display:none!important;}.sheet{box-shadow:none!important;border:none!important;margin:0!important;max-width:100%!important;}body{background:#fff!important;}}
      `}</style>

      {view!=="preview"&&(<div className="no-print" style={topbar}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{...logoDot,background:accent}}>{(settings.bizName||"?").slice(0,1).toUpperCase()}</div>
          <div>
            <div style={{fontFamily:brand,fontWeight:800,fontSize:17,lineHeight:1}}>{settings.bizName||"Your Business"}</div>
            <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{saving?"saving…":"all changes saved"}</div>
          </div>
        </div>
        <button onClick={()=>setView("settings")} style={iconBtn}>⚙</button>
      </div>)}

      {view==="settings"&&(<div style={pad}>
        <h2 style={pageTitle}>Business details</h2>
        <p style={subtle}>Appears on every quote, invoice and contract.</p>
        {[["bizName","Business name","e.g. Arctic Air HVAC"],["ownerName","Your name","e.g. Jordan Lee"],["email","Email","you@business.com"],["phone","Phone","(555) 123-4567"],["address","Address","123 Trade St, City"]].map(([k,label,ph])=>(
          <Field key={k} label={label}><input value={settings[k]} placeholder={ph} onChange={e=>setSettings({...settings,[k]:e.target.value})} style={input}/></Field>
        ))}
        <div style={{display:"flex",gap:12}}>
          <Field label="Currency" style={{flex:1}}><input value={settings.currency} onChange={e=>setSettings({...settings,currency:e.target.value})} style={input}/></Field>
          <Field label="Tax label" style={{flex:2}}><input value={settings.taxLabel} placeholder="Tax/VAT/GST" onChange={e=>setSettings({...settings,taxLabel:e.target.value})} style={input}/></Field>
          <Field label="Tax %" style={{flex:1}}><input value={settings.taxRate} inputMode="decimal" onChange={e=>setSettings({...settings,taxRate:e.target.value.replace(/[^0-9.]/g,"")})} style={input}/></Field>
        </div>
        <Field label="Default parts markup %">
          <input value={settings.defaultMarkup} inputMode="decimal" onChange={e=>setSettings({...settings,defaultMarkup:e.target.value.replace(/[^0-9.]/g,"")})} style={input} placeholder="e.g. 30"/>
          <div style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>Applied to materials automatically.</div>
        </Field>
        <Field label="Default payment terms"><textarea value={settings.terms} rows={2} onChange={e=>setSettings({...settings,terms:e.target.value})} style={{...input,resize:"vertical"}}/></Field>
        <Field label="Accent color"><div style={{display:"flex",gap:8}}>{ACCENTS.map(c=>(<button key={c} onClick={()=>setSettings({...settings,accent:c})} style={{width:32,height:32,borderRadius:8,background:c,border:settings.accent===c?"3px solid #111":"3px solid transparent",cursor:"pointer"}}/>))}</div></Field>
        <button onClick={()=>setView("list")} style={{...primaryBtn,background:accent,marginTop:8}}>{settings.bizName?"Done":"Save & continue"}</button>
      </div>)}

      {view==="list"&&(<div style={pad}>
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          <Stat label="Outstanding" value={money(stats.outstanding)} hint="awaiting payment" accent="#B45309"/>
          <Stat label="Won / Active" value={money(stats.won)} hint="accepted / paid / contracts" accent="#047857"/>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <button onClick={()=>newDoc("quote")} style={{...primaryBtn,background:accent,flex:1,padding:"11px 6px",fontSize:13}}>+ Quote</button>
          <button onClick={()=>newDoc("invoice")} style={{...outlineBtn,borderColor:accent,color:accent,flex:1,padding:"11px 6px",fontSize:13}}>+ Invoice</button>
          <button onClick={()=>newDoc("contract")} style={{...outlineBtn,borderColor:"#047857",color:"#047857",flex:1.2,padding:"11px 6px",fontSize:13}}>+ Contract</button>
        </div>
        {docs.length===0?(<div style={empty}><div style={{fontSize:34,marginBottom:8}}>🔧</div>No documents yet.<br/>Create your first quote above.</div>):(
          <div style={{marginTop:16}}>{docs.map(d=>{
            const {total}=totalsOf(d); const st=STATUSES[d.status]||STATUSES.draft;
            const icon=d.type==="contract"?"📋":d.type==="invoice"?"🧾":"📄";
            return(<div key={d.id} className="row" style={listRow} onClick={()=>editDoc(d)}>
              <div style={{fontSize:20,flexShrink:0}}>{icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"monospace",fontSize:11,color:"#9CA3AF"}}>{d.number}</span>
                  <span style={{...badge,color:st.color,background:st.bg}}>{st.label}</span>
                </div>
                <div style={{fontWeight:600,fontSize:15,marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.clientName||"Untitled"}</div>
                <div style={{fontSize:12,color:"#9CA3AF"}}>{d.type==="contract"?"Service Contract":d.type==="invoice"?"Invoice":"Quote"} · {d.date}</div>
              </div>
              <div style={{fontWeight:700,fontSize:16}}>{d.type==="contract"?(d.price?money(d.price)+"/"+(d.billingCycle==="annual"?"yr":"mo"):"—"):money(total)}</div>
            </div>);
          })}</div>
        )}
      </div>)}

      {view==="edit"&&editing&&(<div style={pad}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <button onClick={()=>{setView("list");setEditing(null);}} style={backBtn}>← Back</button>
          <span style={{fontFamily:"monospace",fontSize:12,color:"#9CA3AF"}}>{editing.number}</span>
        </div>
        <h2 style={pageTitle}>{isContract?"🔧 Service Contract":editing.type==="quote"?"Quote":"Invoice"} for…</h2>

        {clients.length>0&&(<div style={{marginBottom:14}}>
          <div style={{...sectionLabel,marginBottom:6}}>Saved clients</div>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
            {clients.map(c=>(<button key={c.name} onClick={()=>applyClient(c)} style={{...chip,whiteSpace:"nowrap",flexShrink:0,...(editing.clientName?.toLowerCase()===c.name.toLowerCase()?{background:accent+"15",color:accent,borderColor:accent}:{})}}>{c.name}</button>))}
          </div>
        </div>)}

        <Field label="Client name"><input value={editing.clientName} placeholder="e.g. Sarah Thompson" onChange={e=>setEditing({...editing,clientName:e.target.value})} style={input}/></Field>
        <div style={{display:"flex",gap:12}}>
          <Field label="Client email" style={{flex:1}}><input value={editing.clientEmail} onChange={e=>setEditing({...editing,clientEmail:e.target.value})} style={input}/></Field>
          <Field label="Date" style={{flex:1}}><input type="date" value={editing.date} onChange={e=>setEditing({...editing,date:e.target.value})} style={input}/></Field>
        </div>
        <Field label="Job / Site address"><input value={editing.clientAddress} onChange={e=>setEditing({...editing,clientAddress:e.target.value})} style={input}/></Field>

        {isContract&&(<>
          <div style={{...sectionLabel,marginTop:16}}>Contract details</div>
          <Field label="Equipment covered"><input value={editing.equipment} onChange={e=>setEditing({...editing,equipment:e.target.value})} style={input} placeholder="Make, model, serial numbers"/></Field>
          <div style={{display:"flex",gap:12}}>
            <Field label="Start date" style={{flex:1}}><input type="date" value={editing.startDate} onChange={e=>setEditing({...editing,startDate:e.target.value})} style={input}/></Field>
            <Field label="End date" style={{flex:1}}><input type="date" value={editing.endDate} onChange={e=>setEditing({...editing,endDate:e.target.value})} style={input}/></Field>
          </div>
          <div style={{display:"flex",gap:12}}>
            <Field label="Price" style={{flex:1}}><div style={{position:"relative"}}><span style={curPrefix}>{cur}</span><input value={editing.price} inputMode="decimal" placeholder="0.00" onChange={e=>setEditing({...editing,price:e.target.value.replace(/[^0-9.]/g,"")})} style={{...input,paddingLeft:24}}/></div></Field>
            <Field label="Billing" style={{flex:1}}><select value={editing.billingCycle} onChange={e=>setEditing({...editing,billingCycle:e.target.value})} style={{...input,cursor:"pointer"}}><option value="annual">Annual</option><option value="monthly">Monthly</option></select></Field>
          </div>
          <div style={{...sectionLabel,marginTop:16}}>Services included</div>
          {editing.services.map((s,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
            <input value={s} onChange={e=>{const services=editing.services.map((sv,si)=>si===i?e.target.value:sv);setEditing({...editing,services});}} style={{...input,flex:1}}/>
            <button onClick={()=>setEditing({...editing,services:editing.services.filter((_,si)=>si!==i)})} style={delBtn}>×</button>
          </div>))}
          <button onClick={()=>setEditing({...editing,services:[...editing.services,""]})} style={{...outlineBtn,borderColor:"#D1D5DB",color:"#374151",width:"100%",marginBottom:16}}>+ Add service</button>
        </>)}

        {!isContract&&(<>
          <div style={{...sectionLabel,marginTop:18}}>⚡ HVAC quick-fill</div>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:14}}>
            {HVAC_TEMPLATES.map(tpl=>(<button key={tpl.label} onClick={()=>applyTemplate(tpl)} style={{...chip,flexShrink:0,whiteSpace:"nowrap",background:"#FFF7ED",borderColor:accent,color:accent}}>{tpl.label}</button>))}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={sectionLabel}>Line items</div>
            <button onClick={()=>setMarkupMode(m=>!m)} style={{...chip,fontSize:11,padding:"4px 10px",background:markupMode?accent+"15":"#fff",color:markupMode?accent:"#6B7280",borderColor:markupMode?accent:"#D1D5DB"}}>{markupMode?"✓ Markup ON":"Markup mode"}</button>
          </div>
          {markupMode&&(<div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:12,color:"#92400E"}}><strong>Markup mode:</strong> Enter your cost price for materials + markup %. Labour uses rate directly.</div>)}
          {editing.items.map((it,i)=>(<div key={it.id} style={itemCard}>
            <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
              <input value={it.desc} placeholder="Description" onChange={e=>updItem(i,"desc",e.target.value)} style={{...input,flex:1}}/>
              {markupMode&&(<button onClick={()=>updItem(i,"isMaterial",!it.isMaterial)} style={{...chip,fontSize:11,padding:"6px 10px",flexShrink:0,background:it.isMaterial?"#DBEAFE":"#F3F4F6",color:it.isMaterial?"#1D4ED8":"#6B7280",borderColor:it.isMaterial?"#93C5FD":"#E5E7EB"}}>{it.isMaterial?"Part":"Labour"}</button>)}
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <input value={it.qty} inputMode="decimal" placeholder="Qty" onChange={e=>updItem(i,"qty",e.target.value.replace(/[^0-9.]/g,""))} style={{...input,width:52,textAlign:"center",padding:"8px 6px"}}/>
              <span style={{color:"#9CA3AF"}}>×</span>
              {markupMode&&it.isMaterial?(<>
                <div style={{position:"relative",flex:1,minWidth:70}}><span style={curPrefix}>{cur}</span><input value={it.cost} inputMode="decimal" placeholder="Cost" onChange={e=>updItem(i,"cost",e.target.value.replace(/[^0-9.]/g,""))} style={{...input,paddingLeft:22,padding:"8px 8px 8px 22px"}}/></div>
                <span style={{color:"#9CA3AF",fontSize:12}}>+</span>
                <div style={{position:"relative",width:64}}><input value={it.markup??settings.defaultMarkup} inputMode="decimal" placeholder="%" onChange={e=>updItem(i,"markup",e.target.value.replace(/[^0-9.]/g,""))} style={{...input,paddingRight:20,padding:"8px 20px 8px 8px",textAlign:"right"}}/><span style={{position:"absolute",right:7,top:"50%",transform:"translateY(-50%)",color:"#9CA3AF",fontSize:12}}>%</span></div>
                <span style={{fontSize:12,color:"#047857",fontWeight:700,minWidth:60,textAlign:"right"}}>= {money((Number(it.cost)||0)*(1+(Number(it.markup??settings.defaultMarkup)||0)/100)*(Number(it.qty)||0))}</span>
              </>):(<>
                <div style={{position:"relative",flex:1}}><span style={curPrefix}>{cur}</span><input value={it.cost} inputMode="decimal" placeholder="Rate" onChange={e=>updItem(i,"cost",e.target.value.replace(/[^0-9.]/g,""))} style={{...input,paddingLeft:22,padding:"8px 8px 8px 22px"}}/></div>
                <span style={{width:68,textAlign:"right",fontWeight:600,fontSize:13}}>{money((Number(it.qty)||0)*itemRate(it))}</span>
              </>)}
              {editing.items.length>1&&(<button onClick={()=>rmItem(i)} style={delBtn}>×</button>)}
            </div>
          </div>))}
          <button onClick={addItem} style={{...outlineBtn,borderColor:"#D1D5DB",color:"#374151",width:"100%",marginTop:4}}>+ Add line</button>
          <div style={totalsBox}>{(()=>{
            const t=totalsOf(editing);
            const mCost=editing.items.reduce((a,it)=>a+(it.isMaterial?(Number(it.cost)||0)*(Number(it.qty)||0):0),0);
            const mSell=editing.items.reduce((a,it)=>a+(it.isMaterial?(Number(it.qty)||0)*itemRate(it):0),0);
            const profit=mSell-mCost;
            return(<>
              <Row k="Subtotal" v={money(t.sub)}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0"}}>
                <span style={{display:"flex",alignItems:"center",gap:6,color:"#6B7280",fontSize:14}}>{settings.taxLabel}<input value={editing.taxRate} inputMode="decimal" onChange={e=>setEditing({...editing,taxRate:e.target.value.replace(/[^0-9.]/g,"")})} style={{...input,width:50,padding:"4px 6px",textAlign:"center"}}/>%</span>
                <span>{money(t.tax)}</span>
              </div>
              <div style={{height:1,background:"#E5E7EB",margin:"6px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:18}}><span>Total</span><span style={{color:accent}}>{money(t.total)}</span></div>
              {markupMode&&profit>0&&(<div style={{marginTop:10,background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#166534"}}>💰 Parts margin: {money(profit)} ({mCost>0?Math.round((profit/mCost)*100):0}% on cost)</div>)}
            </>);
          })()}</div>
        </>)}

        <Field label="Notes" style={{marginTop:16}}><textarea value={editing.notes} rows={2} placeholder="Anything else for the client…" onChange={e=>setEditing({...editing,notes:e.target.value})} style={{...input,resize:"vertical"}}/></Field>
        <div style={{...sectionLabel,marginTop:14}}>Status</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:18}}>
          {(isContract?["draft","sent","active","expired"]:editing.type==="quote"?["draft","sent","accepted","declined"]:["draft","sent","paid"]).map(s=>(
            <button key={s} onClick={()=>setEditing({...editing,status:s})} style={{...chip,...(editing.status===s?{background:STATUSES[s].bg,color:STATUSES[s].color,borderColor:STATUSES[s].color}:{})}}>{STATUSES[s].label}</button>
          ))}
        </div>
        {docs.some(d=>d.id===editing.id)&&(<button onClick={()=>duplicateDoc(editing)} style={{...outlineBtn,borderColor:"#D1D5DB",color:"#374151",width:"100%",marginBottom:10}}>⧉ Duplicate</button>)}
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>deleteDoc(editing.id)} style={{...outlineBtn,borderColor:"#FCA5A5",color:"#DC2626"}}>Delete</button>
          <button onClick={saveDoc} style={{...outlineBtn,borderColor:accent,color:accent,flex:1}}>Save</button>
          <button onClick={()=>{saveDoc();setEditing(editing);setView("preview");}} style={{...primaryBtn,background:accent,flex:1}}>Preview / PDF</button>
        </div>
      </div>)}

      {view==="preview"&&editing&&(<div>
        <div className="no-print" style={{...topbar,justifyContent:"space-between"}}>
          <button onClick={()=>setView("edit")} style={backBtn}>← Edit</button>
          <button onClick={()=>window.print()} style={{...primaryBtn,background:accent,width:"auto",padding:"10px 18px"}}>⬇ Save as PDF</button>
        </div>
        {editing.type==="contract"
          ?<ContractSheet doc={editing} settings={settings} accent={accent} money={money} brand={brand}/>
          :<DocumentSheet doc={editing} settings={settings} accent={accent} money={money} totalsOf={totalsOf} brand={brand} itemRate={itemRate}/>}
        <p className="no-print" style={{textAlign:"center",color:"#9CA3AF",fontSize:12,padding:"8px 20px 24px"}}>Tip: in the print dialog, choose "Save as PDF".</p>
      </div>)}
    </div>
  );
}

function DocumentSheet({doc,settings,accent,money,totalsOf,brand,itemRate}){
  const t=totalsOf(doc); const title=doc.type==="quote"?"QUOTE":"INVOICE";
  return(<div className="sheet" style={sheet}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
      <div>
        <div style={{fontFamily:brand,fontWeight:800,fontSize:22,color:"#111"}}>{settings.bizName||"Your Business"}</div>
        <div style={{fontSize:12,color:"#6B7280",marginTop:4,lineHeight:1.6}}>
          {settings.ownerName&&<div>{settings.ownerName}</div>}
          {settings.address&&<div>{settings.address}</div>}
          {settings.phone&&<div>{settings.phone}</div>}
          {settings.email&&<div>{settings.email}</div>}
        </div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontFamily:brand,fontWeight:800,fontSize:26,letterSpacing:"0.05em",color:accent}}>{title}</div>
        <div style={{fontFamily:"monospace",fontSize:13,color:"#374151",marginTop:4}}>{doc.number}</div>
        <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>{doc.date}</div>
      </div>
    </div>
    <div style={{background:"#F9FAFB",borderRadius:10,padding:"14px 16px",marginBottom:24}}>
      <div style={{fontSize:10,letterSpacing:"0.12em",color:"#9CA3AF",textTransform:"uppercase",marginBottom:4}}>{doc.type==="quote"?"Prepared for":"Bill to"}</div>
      <div style={{fontWeight:700,fontSize:15}}>{doc.clientName}</div>
      {doc.clientEmail&&<div style={{fontSize:12,color:"#6B7280"}}>{doc.clientEmail}</div>}
      {doc.clientAddress&&<div style={{fontSize:12,color:"#6B7280"}}>{doc.clientAddress}</div>}
    </div>
    <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
      <thead><tr style={{borderBottom:`2px solid ${accent}`}}>
        <th style={th}>Description</th>
        <th style={{...th,textAlign:"center",width:40}}>Qty</th>
        <th style={{...th,textAlign:"right",width:80}}>Rate</th>
        <th style={{...th,textAlign:"right",width:90}}>Amount</th>
      </tr></thead>
      <tbody>{doc.items.filter(it=>it.desc||it.cost).map(it=>{
        const rate=itemRate(it); const amt=(Number(it.qty)||0)*rate;
        return(<tr key={it.id} style={{borderBottom:"1px solid #F3F4F6"}}>
          <td style={td}>{it.desc||"—"}</td>
          <td style={{...td,textAlign:"center"}}>{it.qty}</td>
          <td style={{...td,textAlign:"right"}}>{money(rate)}</td>
          <td style={{...td,textAlign:"right",fontWeight:600}}>{money(amt)}</td>
        </tr>);
      })}</tbody>
    </table>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:28}}>
      <div style={{width:240}}>
        <Row k="Subtotal" v={money(t.sub)}/>
        <Row k={`${settings.taxLabel} (${doc.taxRate||0}%)`} v={money(t.tax)}/>
        <div style={{height:2,background:"#111",margin:"8px 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:18}}><span>Total</span><span style={{color:accent}}>{money(t.total)}</span></div>
      </div>
    </div>
    {doc.notes&&<div style={{marginBottom:18}}><div style={noteLabel}>Notes</div><div style={{fontSize:13,color:"#374151"}}>{doc.notes}</div></div>}
    {settings.terms&&<div><div style={noteLabel}>Terms</div><div style={{fontSize:12,color:"#6B7280"}}>{settings.terms}</div></div>}
    <div style={{textAlign:"center",marginTop:36,fontSize:11,color:"#9CA3AF"}}>Thank you for your business.</div>
  </div>);
}

function ContractSheet({doc,settings,accent,money,brand}){
  return(<div className="sheet" style={sheet}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
      <div>
        <div style={{fontFamily:brand,fontWeight:800,fontSize:22,color:"#111"}}>{settings.bizName||"Your Business"}</div>
        <div style={{fontSize:12,color:"#6B7280",marginTop:4,lineHeight:1.6}}>
          {settings.ownerName&&<div>{settings.ownerName}</div>}
          {settings.address&&<div>{settings.address}</div>}
          {settings.phone&&<div>{settings.phone}</div>}
          {settings.email&&<div>{settings.email}</div>}
        </div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontFamily:brand,fontWeight:800,fontSize:22,letterSpacing:"0.04em",color:accent}}>SERVICE CONTRACT</div>
        <div style={{fontFamily:"monospace",fontSize:13,color:"#374151",marginTop:4}}>{doc.number}</div>
        <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>{doc.date}</div>
      </div>
    </div>
    <div style={{display:"flex",gap:12,marginBottom:24}}>
      {[{label:"Service Provider",name:settings.bizName,phone:settings.phone,email:settings.email},{label:"Customer",name:doc.clientName,phone:doc.clientEmail,email:doc.clientAddress}].map(p=>(
        <div key={p.label} style={{flex:1,background:"#F9FAFB",borderRadius:10,padding:"14px 16px"}}>
          <div style={noteLabel}>{p.label}</div>
          <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
          <div style={{fontSize:12,color:"#6B7280"}}>{p.phone}</div>
          <div style={{fontSize:12,color:"#6B7280"}}>{p.email}</div>
        </div>
      ))}
    </div>
    <div style={{background:"#FFF7ED",border:`1px solid ${accent}40`,borderRadius:10,padding:"14px 16px",marginBottom:24}}>
      <div style={noteLabel}>Contract term</div>
      <div style={{fontWeight:700,fontSize:15}}>{doc.startDate} → {doc.endDate}</div>
      <div style={{fontSize:13,color:"#374151",marginTop:6}}><strong>{doc.price?money(doc.price):"—"}</strong> billed {doc.billingCycle==="annual"?"annually":"monthly"}</div>
    </div>
    {doc.equipment&&<div style={{marginBottom:20}}><div style={noteLabel}>Equipment covered</div><div style={{fontSize:13,color:"#374151"}}>{doc.equipment}</div></div>}
    <div style={{marginBottom:24}}>
      <div style={noteLabel}>Services included</div>
      {doc.services.filter(Boolean).map((s,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}><span style={{color:accent,fontWeight:700}}>✓</span><span style={{fontSize:13,color:"#374151"}}>{s}</span></div>))}
    </div>
    {doc.notes&&<div style={{marginBottom:18}}><div style={noteLabel}>Notes</div><div style={{fontSize:13,color:"#374151"}}>{doc.notes}</div></div>}
    <div style={{display:"flex",gap:24,marginTop:40}}>
      {[settings.bizName||"Service Provider",doc.clientName||"Customer"].map(name=>(<div key={name} style={{flex:1}}><div style={{borderTop:"1.5px solid #374151",paddingTop:6}}><div style={{fontSize:11,color:"#6B7280"}}>{name}</div><div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>Signature & Date</div></div></div>))}
    </div>
  </div>);
}

const Field=({label,children,style})=>(<div style={{marginBottom:14,...style}}><label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:6}}>{label}</label>{children}</div>);
const Row=({k,v})=>(<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:14,color:"#374151"}}><span>{k}</span><span>{v}</span></div>);
const Stat=({label,value,hint,accent})=>(<div style={{flex:1,background:"#fff",border:"1px solid #EEF0F2",borderRadius:14,padding:"14px 16px"}}><div style={{fontSize:11,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div><div style={{fontSize:20,fontWeight:800,color:accent,margin:"4px 0 1px"}}>{value}</div><div style={{fontSize:11,color:"#9CA3AF"}}>{hint}</div></div>);

const brand="'Bricolage Grotesque', sans-serif";
const wrap={fontFamily:"'Hanken Grotesk', system-ui, sans-serif",background:"#F4F5F7",minHeight:"100vh",color:"#111827",maxWidth:560,margin:"0 auto"};
const topbar={display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:"#fff",borderBottom:"1px solid #EEF0F2",position:"sticky",top:0,zIndex:10};
const logoDot={width:36,height:36,borderRadius:9,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontFamily:"'Bricolage Grotesque', sans-serif",fontSize:18};
const pad={padding:"18px"};
const pageTitle={fontFamily:"'Bricolage Grotesque', sans-serif",fontWeight:800,fontSize:22,margin:"0 0 4px"};
const subtle={fontSize:13,color:"#9CA3AF",margin:"0 0 18px"};
const sectionLabel={fontSize:11,fontWeight:700,color:"#374151",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"};
const input={width:"100%",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"10px 12px",fontSize:14,background:"#fff",color:"#111827"};
const primaryBtn={width:"100%",color:"#fff",border:"none",borderRadius:11,padding:"13px",fontSize:15,fontWeight:700,cursor:"pointer"};
const outlineBtn={background:"#fff",border:"1.5px solid",borderRadius:11,padding:"12px 14px",fontSize:14,fontWeight:600,cursor:"pointer"};
const iconBtn={background:"#F3F4F6",border:"none",borderRadius:9,width:38,height:38,fontSize:18,cursor:"pointer"};
const backBtn={background:"none",border:"none",color:"#6B7280",fontSize:14,cursor:"pointer",padding:0,fontWeight:600};
const listRow={display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:"#fff",border:"1px solid #EEF0F2",borderRadius:12,marginBottom:8,cursor:"pointer"};
const badge={fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,letterSpacing:"0.03em"};
const empty={textAlign:"center",color:"#9CA3AF",fontSize:14,padding:"50px 20px",lineHeight:1.6};
const itemCard={background:"#fff",border:"1px solid #EEF0F2",borderRadius:12,padding:"12px",marginBottom:8};
const curPrefix={position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:"#9CA3AF",fontSize:14};
const delBtn={background:"#FEF2F2",color:"#DC2626",border:"none",borderRadius:8,width:30,height:30,fontSize:18,cursor:"pointer",flexShrink:0};
const totalsBox={background:"#fff",border:"1px solid #EEF0F2",borderRadius:12,padding:"12px 16px",marginTop:12};
const chip={background:"#fff",border:"1.5px solid #E5E7EB",color:"#6B7280",borderRadius:20,padding:"7px 14px",fontSize:13,fontWeight:600,cursor:"pointer"};
const sheet={background:"#fff",maxWidth:520,margin:"16px",padding:"32px 28px",borderRadius:12,boxShadow:"0 1px 3px rgba(0,0,0,.08)",fontFamily:"'Hanken Grotesk', system-ui, sans-serif"};
const th={textAlign:"left",fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",color:"#9CA3AF",padding:"0 0 8px",fontWeight:700};
const td={fontSize:13,color:"#1F2937",padding:"10px 0",verticalAlign:"top"};
const noteLabel={fontSize:10,letterSpacing:"0.12em",color:"#9CA3AF",textTransform:"uppercase",marginBottom:4};

