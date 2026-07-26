// import { useState, useEffect } from 'react';
// import { matchAPI, resumeAPI, proposalAPI } from '../services/api';
// import { scoreColor, parseMissingSkills } from '../utils/helpers';
// import AppLayout     from '../components/layout/AppLayout';
// import { useAppToast } from '../components/layout/AppLayout';
// import Card          from '../components/ui/Card';
// import Button        from '../components/ui/Button';
// import Badge         from '../components/ui/Badge';
// import Spinner       from '../components/ui/Spinner';
// import EmptyState    from '../components/ui/EmptyState';
// import ProgressBar   from '../components/ui/ProgressBar';
// import {
//   Zap, Copy, Save, RefreshCw, CheckCircle,
//   Sparkles, Briefcase, ChevronRight, Mail,
//   FileText, Star,
// } from 'lucide-react';

// export default function Proposals() {
//   const toast = useAppToast();

//   const [topMatches,   setTopMatches]   = useState([]);
//   const [resumes,      setResumes]      = useState([]);
//   const [selectedJob,  setSelectedJob]  = useState(null);
//   const [proposal,     setProposal]     = useState(null);
//   const [loading,      setLoading]      = useState(true);
//   const [generating,   setGenerating]   = useState(false);
//   const [savedProposals, setSavedProposals] = useState([]);
//   const [activeTab,    setActiveTab]    = useState('generate'); // 'generate' | 'history'
//   const [copied,       setCopied]       = useState('');

//   useEffect(() => {
//     Promise.all([
//       matchAPI.getTop().catch(()      => ({ data: [] })),
//       resumeAPI.getMine().catch(()    => ({ data: [] })),
//       proposalAPI.getMyProposals().catch(() => ({ data: [] })),
//     ]).then(([m, r, p]) => {
//       setTopMatches(m.data || []);
//       setResumes(r.data    || []);
//       setSavedProposals(p.data || []);
//     }).finally(() => setLoading(false));
//   }, []);

//   const processedResume = resumes.find(r => r.status === 'processed');

//   const generate = async (job) => {
//     if (!processedResume) {
//       toast?.error('Please upload and process a resume first.');
//       return;
//     }
//     setSelectedJob(job);
//     setProposal(null);
//     setGenerating(true);
//     try {
//       const { data } = await proposalAPI.generate({
//         job_id:    job.job_id,
//         resume_id: processedResume.resume_id,
//       });
//       setProposal(data);
//       toast?.success('✅ Proposal generated!');
//     } catch (e) {
//       toast?.error(e.response?.data?.message || 'Generation failed.');
//     } finally { setGenerating(false); }
//   };

//   const copyText = (text, key) => {
//     navigator.clipboard.writeText(text);
//     setCopied(key);
//     setTimeout(() => setCopied(''), 2000);
//     toast?.success('Copied to clipboard!');
//   };

//   const TABS = [
//     { key:'generate', label:'Generate',      icon: Zap      },
//     { key:'history',  label:`History (${savedProposals.length})`, icon: FileText },
//   ];

//   return (
//     <AppLayout>
//       <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

//         {/* Header */}
//         <div className="anim-fadeInUp">
//           <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
//             AI Proposal Generator
//           </h1>
//           <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
//             Generate tailored proposals for your top matched jobs using AI.
//           </p>
//         </div>

//         {/* Tabs */}
//         <div style={{ display:'flex', gap:4, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:4, width:'fit-content' }}>
//           {TABS.map(({ key, label, icon: Icon }) => (
//             <button key={key} onClick={() => setActiveTab(key)} style={{
//               display:'flex', alignItems:'center', gap:7,
//               padding:'8px 16px', borderRadius:9, border:'none', cursor:'pointer',
//               fontSize:13, fontWeight: activeTab===key ? 600 : 400,
//               color:      activeTab===key ? 'white' : 'var(--text-secondary)',
//               background: activeTab===key ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'transparent',
//               transition: 'all 0.18s',
//             }}>
//               <Icon size={13}/>{label}
//             </button>
//           ))}
//         </div>

//         {/* Generate tab */}
//         {activeTab === 'generate' && (
//           <div className="anim-fadeIn" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

//             {/* Left — job picker */}
//             <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
//               <Card>
//                 <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
//                   <Star size={15} color="#F59E0B" fill="#F59E0B" />
//                   <p style={{ fontWeight:600, fontSize:15, color:'var(--text-primary)' }}>
//                     Top Matched Jobs
//                   </p>
//                   <Badge color="warning">Top 5</Badge>
//                 </div>

//                 {!processedResume && (
//                   <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
//                     <p style={{ fontSize:12, color:'#FCD34D' }}>
//                       ⚠ Upload and process a resume first to generate proposals.
//                     </p>
//                   </div>
//                 )}

//                 {loading ? (
//                   <div style={{ display:'flex', justifyContent:'center', padding:32 }}>
//                     <Spinner />
//                   </div>
//                 ) : topMatches.length === 0 ? (
//                   <EmptyState
//                     icon="🎯"
//                     title="No matches yet"
//                     desc="Upload a resume and run job matching to generate proposals."
//                   />
//                 ) : (
//                   <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
//                     {topMatches.slice(0, 5).map((job, i) => {
//                       const isSelected = selectedJob?.job_id === job.job_id;
//                       return (
//                         <div
//                           key={job.job_id}
//                           className={`anim-fadeInUp delay-${i+1}`}
//                           style={{
//                             background:   isSelected ? 'rgba(99,102,241,0.08)' : 'var(--bg-elevated)',
//                             border:       `1px solid ${isSelected ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
//                             borderRadius: 12, padding:'14px 16px',
//                             transition:   'all 0.15s',
//                           }}
//                         >
//                           <div style={{ display:'flex', alignItems:'center', gap:10 }}>
//                             {/* Rank */}
//                             <div style={{
//                               width:28, height:28, borderRadius:8, flexShrink:0,
//                               background: i===0 ? 'rgba(245,158,11,0.15)' : 'var(--border)',
//                               display:'flex', alignItems:'center', justifyContent:'center',
//                               fontSize:11, fontWeight:700,
//                               color: i===0 ? '#F59E0B' : 'var(--text-muted)',
//                             }}>#{i+1}</div>

//                             {/* Info */}
//                             <div style={{ flex:1, minWidth:0 }}>
//                               <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
//                                 {job.title}
//                               </p>
//                               <p style={{ fontSize:11, color:'var(--text-secondary)' }}>
//                                 {job.company} · {job.location}
//                               </p>
//                             </div>

//                             {/* Score */}
//                             <span style={{ fontSize:13, fontWeight:700, color:scoreColor(job.match_score), flexShrink:0 }}>
//                               {job.match_score}%
//                             </span>
//                           </div>

//                           <div style={{ marginTop:10 }}>
//                             <ProgressBar value={job.match_score} color="auto" showValue={false} height={4} />
//                           </div>

//                           <div style={{ marginTop:12 }}>
//                             <Button
//                               variant={isSelected && proposal ? 'secondary' : 'primary'}
//                               size="sm"
//                               fullWidth
//                               loading={generating && selectedJob?.job_id === job.job_id}
//                               icon={<Zap size={12}/>}
//                               onClick={() => generate(job)}
//                             >
//                               {generating && selectedJob?.job_id === job.job_id
//                                 ? 'Generating...'
//                                 : isSelected && proposal
//                                 ? 'Regenerate'
//                                 : 'Generate Proposal'
//                               }
//                             </Button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </Card>
//             </div>

//             {/* Right — generated proposal */}
//             <Card style={{ display:'flex', flexDirection:'column', minHeight:500 }}>
//               {generating ? (
//                 <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
//                   <div style={{
//                     width:64, height:64, borderRadius:16,
//                     background:'rgba(99,102,241,0.1)',
//                     display:'flex', alignItems:'center', justifyContent:'center',
//                     animation:'pulse 2s ease-in-out infinite',
//                   }}>
//                     <Sparkles size={28} color="var(--primary)" />
//                   </div>
//                   <div style={{ textAlign:'center' }}>
//                     <p style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', marginBottom:6 }}>
//                       AI is crafting your proposal...
//                     </p>
//                     <p style={{ fontSize:12, color:'var(--text-secondary)' }}>
//                       Analyzing job requirements and your resume skills
//                     </p>
//                   </div>
//                   <div style={{ display:'flex', gap:6 }}>
//                     {[0,1,2].map(i => (
//                       <div key={i} style={{
//                         width:9, height:9, borderRadius:'50%', background:'var(--primary)',
//                         animation:`typingDot 1.2s ease ${i*0.2}s infinite`,
//                       }}/>
//                     ))}
//                   </div>
//                 </div>
//               ) : proposal ? (
//                 <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

//                   {/* Header */}
//                   <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
//                     <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//                       <p style={{ fontWeight:600, fontSize:15, color:'var(--text-primary)' }}>
//                         Generated Proposal
//                       </p>
//                       {proposal.ai_powered
//                         ? <Badge color="success" dot>AI Powered</Badge>
//                         : <Badge color="warning">Demo Mode</Badge>
//                       }
//                     </div>
//                     <Button variant="ghost" size="sm" icon={<RefreshCw size={12}/>} onClick={() => selectedJob && generate(selectedJob)}>
//                       Regenerate
//                     </Button>
//                   </div>

//                   {/* Subject line */}
//                   <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px' }}>
//                     <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
//                       <Mail size={12} color="var(--text-muted)"/>
//                       <p style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Subject Line</p>
//                     </div>
//                     <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
//                       <p style={{ fontSize:13, color:'var(--text-primary)' }}>{proposal.subject_line}</p>
//                       <button onClick={() => copyText(proposal.subject_line, 'subject')}
//                         style={{ background:'none', border:'none', cursor:'pointer', color: copied==='subject' ? '#10B981' : 'var(--text-muted)' }}>
//                         {copied==='subject' ? <CheckCircle size={13}/> : <Copy size={13}/>}
//                       </button>
//                     </div>
//                   </div>

//                   {/* Fit points */}
//                   <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:10, padding:'12px 14px' }}>
//                     <p style={{ fontSize:11, fontWeight:600, color:'#10B981', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
//                       Why You're a Strong Fit
//                     </p>
//                     <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
//                       {proposal.fit_points?.map((pt, i) => (
//                         <div key={i} style={{ display:'flex', gap:8 }}>
//                           <CheckCircle size={12} color="#10B981" style={{ flexShrink:0, marginTop:3 }}/>
//                           <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5 }}>{pt}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Gap line */}
//                   {proposal.gap_line && (
//                     <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, padding:'10px 14px' }}>
//                       <p style={{ fontSize:11, fontWeight:600, color:'#F59E0B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Gap Acknowledgment</p>
//                       <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5 }}>{proposal.gap_line}</p>
//                     </div>
//                   )}

//                   {/* Proposal text */}
//                   <div>
//                     <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
//                       <p style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
//                         Full Proposal
//                       </p>
//                       <Button variant="ghost" size="sm" icon={copied==='proposal' ? <CheckCircle size={12}/> : <Copy size={12}/>}
//                         onClick={() => copyText(proposal.proposal, 'proposal')}>
//                         {copied==='proposal' ? 'Copied!' : 'Copy'}
//                       </Button>
//                     </div>
//                     <textarea
//                       value={proposal.proposal}
//                       onChange={e => setProposal(p => ({...p, proposal: e.target.value}))}
//                       style={{
//                         width:'100%', minHeight:220,
//                         background:'var(--bg-elevated)', border:'1px solid var(--border)',
//                         borderRadius:10, padding:14, color:'var(--text-primary)',
//                         fontSize:12, lineHeight:1.8, resize:'vertical',
//                         outline:'none', fontFamily:'var(--font)',
//                       }}
//                     />
//                   </div>
//                 </div>
//               ) : (
//                 <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
//                   <div style={{ width:64, height:64, borderRadius:16, background:'rgba(99,102,241,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
//                     <Zap size={28} color="var(--primary)" />
//                   </div>
//                   <div style={{ textAlign:'center' }}>
//                     <p style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', marginBottom:6 }}>Ready to generate</p>
//                     <p style={{ fontSize:13, color:'var(--text-secondary)', maxWidth:260 }}>
//                       Select a job from the left and click "Generate Proposal" to create a tailored AI cover letter.
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </Card>
//           </div>
//         )}

//         {/* History tab */}
//         {activeTab === 'history' && (
//           <div className="anim-fadeIn">
//             {savedProposals.length === 0 ? (
//               <Card><EmptyState icon="📝" title="No proposals yet" desc="Generate your first proposal from the top matched jobs." action={<Button variant="primary" size="sm" onClick={() => setActiveTab('generate')}>Generate Now</Button>} /></Card>
//             ) : (
//               <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
//                 {savedProposals.map((p, i) => (
//                   <Card key={p.proposal_id} hover className={`anim-fadeInUp delay-${Math.min(i+1,5)}`}>
//                     <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
//                       <div>
//                         <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:3 }}>{p.job_title}</p>
//                         <p style={{ fontSize:12, color:'var(--text-secondary)' }}>{p.company}</p>
//                       </div>
//                       <div style={{ display:'flex', gap:8 }}>
//                         <Badge color={p.status==='draft'?'warning':'success'}>{p.status}</Badge>
//                         <Button variant="ghost" size="sm" icon={<Copy size={11}/>} onClick={() => copyText(p.proposal_text, `p${p.proposal_id}`)}>Copy</Button>
//                       </div>
//                     </div>
//                     <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.7, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
//                       {p.proposal_text}
//                     </p>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </AppLayout>
//   );
// }