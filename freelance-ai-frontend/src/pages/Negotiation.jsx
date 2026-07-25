// import { useState, useRef, useEffect } from 'react';
// import AppLayout     from '../components/layout/AppLayout';
// import Card          from '../components/ui/Card';
// import Button        from '../components/ui/Button';
// import Badge         from '../components/ui/Badge';
// import ProgressBar   from '../components/ui/ProgressBar';
// import { Send, RefreshCw, MessageSquare, Sparkles, TrendingUp } from 'lucide-react';

// const SCENARIOS = [
//   {
//     id:       1,
//     title:    'React Developer Contract',
//     target:   35,
//     initial:  15,
//     avatar:   '👔',
//     company:  'TechStartup',
//     script: [
//       "Hi! I reviewed your proposal for our React project. Your skills look impressive, but our budget is tight — we were thinking $15/hour. Does that work?",
//       "I see. That's higher than we expected. What specifically justifies that rate for this 3-month project?",
//       "Those are fair points. What if we offered $26/hour but guaranteed 6 months of work?",
//       "Interesting perspective. Could you include 2 weeks of post-launch support in that rate?",
//       "You've made a strong case. Let's agree on $33/hour with the support included. Deal?",
//     ],
//   },
//   {
//     id:       2,
//     title:    'Full Stack Project',
//     target:   45,
//     initial:  20,
//     avatar:   '💼',
//     company:  'AgencyXYZ',
//     script: [
//       "We're looking for a full-stack developer for a 2-month project. Budget is around $20/hour — thoughts?",
//       "That seems steep. Our last developer charged $25. Why the difference?",
//       "Fair enough. We could go to $35/hour but need the project done in 6 weeks instead of 8.",
//       "Can you guarantee you'll be available full-time during those 6 weeks?",
//       "Okay, $42/hour full-time for 6 weeks. Final offer — do we have a deal?",
//     ],
//   },
// ];

// const SUGGESTIONS = [
//   "Anchor high — open with your ideal rate, not your minimum",
//   "Justify with value: cite past results and specific skills",
//   "Long-term contracts justify slight rate flexibility",
//   "Never accept the first offer — always counter",
//   "Silence is powerful — let them respond first",
// ];

// export default function Negotiation() {
//   const [scenario,     setScenario]     = useState(SCENARIOS[0]);
//   const [messages,     setMessages]     = useState([]);
//   const [input,        setInput]        = useState('');
//   const [started,      setStarted]      = useState(false);
//   const [clientIdx,    setClientIdx]    = useState(0);
//   const [typing,       setTyping]       = useState(false);
//   const [score,        setScore]        = useState({ confidence:60, communication:55, strategy:50 });
//   const [finalResult,  setFinalResult]  = useState(null);
//   const bottomRef = useRef();

//   useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, typing]);

//   const startSim = (sc = scenario) => {
//     setScenario(sc);
//     setMessages([]);
//     setClientIdx(0);
//     setStarted(true);
//     setTyping(true);
//     setFinalResult(null);
//     setScore({ confidence:60, communication:55, strategy:50 });
//     setTimeout(() => {
//       setMessages([{ role:'client', text: sc.script[0] }]);
//       setTyping(false);
//     }, 1400);
//   };

//   const send = () => {
//     if (!input.trim() || typing || !started) return;
//     const msg    = input.trim();
//     const words  = msg.toLowerCase();
//     setMessages(m => [...m, { role:'user', text: msg }]);
//     setInput('');

//     const nextIdx = clientIdx + 1;

//     // Analyze user response quality
//     const hasNumber    = /\$\d+|\d+\/hour|\d+\s*per/.test(words);
//     const hasJustify   = words.length > 40;
//     const hasValue     = /experience|years|project|client|deliver/.test(words);

//     setScore(s => ({
//       confidence:    Math.min(100, s.confidence    + (hasNumber ? 8 : 3) + Math.floor(Math.random()*5)),
//       communication: Math.min(100, s.communication + (hasJustify ? 7 : 2) + Math.floor(Math.random()*4)),
//       strategy:      Math.min(100, s.strategy      + (hasValue  ? 9 : 2) + Math.floor(Math.random()*5)),
//     }));

//     if (nextIdx < scenario.script.length) {
//       setTyping(true);
//       setClientIdx(nextIdx);
//       setTimeout(() => {
//         setMessages(m => [...m, { role:'client', text: scenario.script[nextIdx] }]);
//         setTyping(false);
//         if (nextIdx === scenario.script.length - 1) {
//           setTimeout(() => {
//             setMessages(m => [...m, {
//               role: 'system',
//               text: `🎉 Negotiation complete! The client offered $${scenario.target - 2}/hour. Review your performance scores.`,
//             }]);
//             setFinalResult({ rate: scenario.target - 2 });
//           }, 800);
//         }
//       }, 1600 + Math.random() * 800);
//     }
//   };

//   const scoreColor = s => s >= 70 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444';
//   const avgScore   = Math.round((score.confidence + score.communication + score.strategy) / 3);

//   return (
//     <AppLayout>
//       <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

//         {/* Header */}
//         <div className="anim-fadeInUp">
//           <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
//             Negotiation Simulator
//           </h1>
//           <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
//             Practice client negotiations with an AI that adapts to your responses.
//           </p>
//           <Badge color="warning" style={{ marginTop:6 }}>Demo mode · Llama 3 integration coming in Phase 5</Badge>
//         </div>

//         <div className="anim-fadeInUp delay-1" style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>

//           {/* Chat */}
//           <Card style={{ padding:0, overflow:'hidden', display:'flex', flexDirection:'column', height:'calc(100vh - 220px)' }}>

//             {/* Chat header */}
//             <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
//               <div style={{ display:'flex', alignItems:'center', gap:12 }}>
//                 <div style={{
//                   width:40, height:40, borderRadius:'50%', fontSize:18,
//                   background:'linear-gradient(135deg,#8B5CF6,#6366F1)',
//                   display:'flex', alignItems:'center', justifyContent:'center',
//                 }}>
//                   {scenario.avatar}
//                 </div>
//                 <div>
//                   <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>
//                     {scenario.company} Client
//                   </p>
//                   <div style={{ display:'flex', alignItems:'center', gap:5 }}>
//                     <div style={{ width:6, height:6, borderRadius:'50%', background: started?'#10B981':'#6B7280', animation: started?'pulseDot 2s infinite':undefined }} />
//                     <p style={{ fontSize:11, color:'var(--text-secondary)' }}>
//                       {started ? 'Active session' : 'Ready to start'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div style={{ display:'flex', gap:8 }}>
//                 {SCENARIOS.map(sc => (
//                   <button key={sc.id} onClick={() => startSim(sc)} style={{
//                     padding:'5px 12px', borderRadius:8, fontSize:11, fontWeight:500,
//                     border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.15s',
//                     background: scenario.id===sc.id ? 'var(--primary)' : 'var(--bg-elevated)',
//                     color:      scenario.id===sc.id ? 'white' : 'var(--text-secondary)',
//                   }}>
//                     {sc.title}
//                   </button>
//                 ))}
//                 <Button variant="ghost" size="sm" icon={<RefreshCw size={12}/>} onClick={() => startSim()}>
//                   Restart
//                 </Button>
//               </div>
//             </div>

//             {/* Messages */}
//             <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:14 }}>
//               {!started ? (
//                 <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, textAlign:'center' }}>
//                   <div style={{ width:72, height:72, borderRadius:18, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
//                     <MessageSquare size={32} color="var(--primary)" />
//                   </div>
//                   <div>
//                     <p style={{ fontSize:16, fontWeight:600, color:'var(--text-primary)', marginBottom:6 }}>
//                       Ready to practice?
//                     </p>
//                     <p style={{ fontSize:13, color:'var(--text-secondary)', maxWidth:300, lineHeight:1.65 }}>
//                       The AI plays a {scenario.company} client offering ${scenario.initial}/hr.
//                       Your target: ${scenario.target}/hr. Negotiate your way there.
//                     </p>
//                   </div>
//                   <Button variant="primary" size="lg" icon={<Sparkles size={14}/>} onClick={() => startSim()}>
//                     Start Negotiation
//                   </Button>
//                 </div>
//               ) : (
//                 <>
//                   {messages.map((msg, i) => (
//                     <div key={i} style={{
//                       display:'flex',
//                       flexDirection: msg.role==='user' ? 'row-reverse' : 'row',
//                       alignItems:'flex-end', gap:8,
//                     }}>
//                       {msg.role !== 'system' && (
//                         <div style={{
//                           width:28, height:28, borderRadius:'50%', flexShrink:0, fontSize:13,
//                           background: msg.role==='client'
//                             ? 'linear-gradient(135deg,#8B5CF6,#6366F1)'
//                             : 'linear-gradient(135deg,#10B981,#059669)',
//                           display:'flex', alignItems:'center', justifyContent:'center',
//                         }}>
//                           {msg.role==='client' ? scenario.avatar : '🧑‍💻'}
//                         </div>
//                       )}
//                       <div style={{
//                         maxWidth:  msg.role==='system' ? '100%' : '72%',
//                         background:
//                           msg.role==='user'   ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))'
//                           : msg.role==='system' ? 'rgba(16,185,129,0.1)'
//                           : 'var(--bg-elevated)',
//                         border:`1px solid ${
//                           msg.role==='user'   ? 'rgba(99,102,241,0.3)'
//                           : msg.role==='system' ? 'rgba(16,185,129,0.25)'
//                           : 'var(--border)'
//                         }`,
//                         borderRadius:
//                           msg.role==='user'   ? '16px 16px 4px 16px'
//                           : msg.role==='system' ? 10
//                           : '16px 16px 16px 4px',
//                         padding:'10px 14px',
//                         textAlign: msg.role==='system' ? 'center' : 'left',
//                         animation: 'fadeInUp 0.25s ease',
//                       }}>
//                         <p style={{ fontSize:13, color:'var(--text-primary)', lineHeight:1.65 }}>
//                           {msg.text}
//                         </p>
//                       </div>
//                     </div>
//                   ))}

//                   {/* Typing indicator */}
//                   {typing && (
//                     <div style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
//                       <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>
//                         {scenario.avatar}
//                       </div>
//                       <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'16px 16px 16px 4px', padding:'12px 16px' }}>
//                         <div style={{ display:'flex', gap:5, alignItems:'center' }}>
//                           {[0,1,2].map(i => (
//                             <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--text-muted)', animation:`typingDot 1.2s ease ${i*0.2}s infinite` }}/>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                   <div ref={bottomRef} />
//                 </>
//               )}
//             </div>

//             {/* Input */}
//             {started && !finalResult && (
//               <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
//                 <input
//                   value={input}
//                   onChange={e => setInput(e.target.value)}
//                   onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
//                   placeholder="Type your response... (Enter to send)"
//                   disabled={typing}
//                   style={{
//                     flex:1, background:'var(--bg-elevated)', border:'1px solid var(--border-light)',
//                     borderRadius:10, padding:'10px 14px', color:'var(--text-primary)',
//                     fontSize:13, outline:'none', opacity: typing ? 0.5 : 1, fontFamily:'var(--font)',
//                     transition:'border-color 0.15s',
//                   }}
//                   onFocus={e => e.target.style.borderColor = 'var(--primary)'}
//                   onBlur={e  => e.target.style.borderColor = 'var(--border-light)'}
//                 />
//                 <Button variant="primary" onClick={send} disabled={typing||!input.trim()} icon={<Send size={14}/>}>
//                   Send
//                 </Button>
//               </div>
//             )}
//           </Card>

//           {/* Side panel */}
//           <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

//             {/* Scores */}
//             <Card>
//               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
//                 <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>Performance</p>
//                 <span style={{ fontSize:18, fontWeight:800, color:scoreColor(avgScore) }}>{avgScore}%</span>
//               </div>
//               <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
//                 {[
//                   { label:'Confidence',    value:score.confidence    },
//                   { label:'Communication', value:score.communication },
//                   { label:'Strategy',      value:score.strategy      },
//                 ].map(({ label, value }) => (
//                   <div key={label}>
//                     <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
//                       <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{label}</span>
//                       <span style={{ fontSize:12, fontWeight:600, color:scoreColor(value) }}>{value}%</span>
//                     </div>
//                     <ProgressBar value={value} color="auto" showValue={false} height={5} />
//                   </div>
//                 ))}
//               </div>
//             </Card>

//             {/* Scenario info */}
//             <Card>
//               <p style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)', marginBottom:12 }}>Scenario</p>
//               <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
//                 {[
//                   { label:'Your target', value:`$${scenario.target}/hr`, color:'#10B981' },
//                   { label:'Their offer', value:`$${scenario.initial}/hr`, color:'#EF4444' },
//                   { label:'Gap to close', value:`$${scenario.target - scenario.initial}/hr`, color:'#F59E0B' },
//                 ].map(({ label, value, color }) => (
//                   <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 10px', background:'var(--bg-elevated)', borderRadius:8 }}>
//                     <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{label}</span>
//                     <span style={{ fontSize:12, fontWeight:700, color }}>{value}</span>
//                   </div>
//                 ))}
//               </div>
//             </Card>

//             {/* Tips */}
//             <Card>
//               <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
//                 <TrendingUp size={13} color="var(--primary)" />
//                 <p style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)' }}>AI Tips</p>
//               </div>
//               <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
//                 {SUGGESTIONS.map((s, i) => (
//                   <div key={i} style={{ display:'flex', gap:8, padding:'7px 10px', background:'var(--bg-elevated)', borderRadius:8 }}>
//                     <div style={{ width:16, height:16, borderRadius:'50%', background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'var(--primary)', flexShrink:0 }}>
//                       {i+1}
//                     </div>
//                     <p style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.5 }}>{s}</p>
//                   </div>
//                 ))}
//               </div>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </AppLayout>
//   );
// }