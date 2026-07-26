import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { matchAPI, resumeAPI, proposalAPI } from '../services/api';
import { scoreColor, parseMissingSkills, truncate } from '../utils/helpers';
import AppLayout, { useAppToast } from '../components/layout/AppLayout';
import Card        from '../components/ui/Card';
import Button       from '../components/ui/Button';
import Badge        from '../components/ui/Badge';
import Spinner      from '../components/ui/Spinner';
import EmptyState   from '../components/ui/EmptyState';
import ProgressBar  from '../components/ui/ProgressBar';
import Modal        from '../components/ui/Modal';
import {
  Zap, Copy, Download, RefreshCw, CheckCircle,
  Sparkles, Briefcase, Mail, FileText, Star,
  Building2, MapPin, DollarSign,
} from 'lucide-react';

const CONTENT_LABELS = {
  cover_letter: 'Cover Letter',
  proposal:     'Freelance Proposal',
};

export default function Proposals() {
  const toast = useAppToast();

  const [topMatches,     setTopMatches]     = useState([]);
  const [resumes,        setResumes]        = useState([]);
  const [savedProposals, setSavedProposals] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState('generate'); // 'generate' | 'history'

  const [modalOpen,       setModalOpen]       = useState(false);
  const [modalJob,        setModalJob]        = useState(null);
  const [modalType,       setModalType]       = useState(null);
  const [modalContent,    setModalContent]    = useState('');
  const [modalGenerating, setModalGenerating] = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [copied,          setCopied]          = useState(false);

  useEffect(() => {
    Promise.all([
      matchAPI.getTop().catch(()      => ({ data: [] })),
      resumeAPI.getMine().catch(()    => ({ data: [] })),
      proposalAPI.getMyProposals().catch(() => ({ data: [] })),
    ]).then(([m, r, p]) => {
      setTopMatches(m.data || []);
      setResumes(r.data    || []);
      setSavedProposals(p.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const processedResume = resumes.find(r => r.status === 'processed');

  const generate = async (job, content_type) => {
    if (!processedResume) {
      toast?.error('Please upload and process a resume first.');
      return;
    }
    setModalJob(job);
    setModalType(content_type);
    setModalContent('');
    setCopied(false);
    setModalOpen(true);
    setModalGenerating(true);
    try {
      const { data } = await proposalAPI.generate({
        job_id:       job.job_id,
        resume_id:    processedResume.resume_id,
        content_type,
      });
      setModalContent(data.content);
      toast?.success('✅ Generated!');
    } catch (e) {
      toast?.error(e.response?.data?.message || 'Generation failed.');
      setModalOpen(false);
    } finally {
      setModalGenerating(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(modalContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast?.success('Copied to clipboard!');
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      await proposalAPI.save({
        job_id:        modalJob.job_id,
        proposal_type: modalType,
        proposal_text: modalContent,
      });
      toast?.success('Saved!');
      const { data } = await proposalAPI.getMyProposals();
      setSavedProposals(data || []);
    } catch (e) {
      toast?.error(e.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(modalContent, 180);
    doc.setFontSize(11);
    doc.text(lines, 15, 20);
    doc.save(`${modalType}-${(modalJob?.company || 'proposal').replace(/\s+/g, '_')}.pdf`);
  };

  const TABS = [
    { key:'generate', label:'Generate',      icon: Zap      },
    { key:'history',  label:`History (${savedProposals.length})`, icon: FileText },
  ];

  return (
    <AppLayout>
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

        {/* Header */}
        <div className="anim-fadeInUp">
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
            AI Proposal Generator
          </h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
            Generate tailored cover letters and freelance proposals for your top matched jobs using AI.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:4, width:'fit-content' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              display:'flex', alignItems:'center', gap:7,
              padding:'8px 16px', borderRadius:9, border:'none', cursor:'pointer',
              fontSize:13, fontWeight: activeTab===key ? 600 : 400,
              color:      activeTab===key ? 'white' : 'var(--text-secondary)',
              background: activeTab===key ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'transparent',
              transition: 'all 0.18s',
            }}>
              <Icon size={13}/>{label}
            </button>
          ))}
        </div>

        {/* Generate tab */}
        {activeTab === 'generate' && (
          <div className="anim-fadeIn">
            <Card>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <Star size={15} color="#F59E0B" fill="#F59E0B" />
                <p style={{ fontWeight:600, fontSize:15, color:'var(--text-primary)' }}>
                  Top Matched Jobs
                </p>
                <Badge color="warning">Top {topMatches.length || 5}</Badge>
              </div>

              {!processedResume && (
                <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
                  <p style={{ fontSize:12, color:'#FCD34D' }}>
                    ⚠ Upload and process a resume first to generate proposals.
                  </p>
                </div>
              )}

              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:32 }}>
                  <Spinner />
                </div>
              ) : topMatches.length === 0 ? (
                <EmptyState
                  icon="🎯"
                  title="No matches yet"
                  desc="Upload a resume and run job matching to generate proposals."
                />
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:14 }}>
                  {topMatches.map((job, i) => {
                    const matchedSkills = parseMissingSkills(job.matched_skills);
                    const missingSkills = parseMissingSkills(job.missing_skills);
                    return (
                      <div
                        key={job.job_id}
                        className={`anim-fadeInUp delay-${Math.min(i+1,5)}`}
                        style={{
                          background:   'var(--bg-elevated)',
                          border:       '1px solid var(--border)',
                          borderRadius: 12, padding:'16px 18px',
                          display:'flex', flexDirection:'column', gap:12,
                        }}
                      >
                        {/* Header row */}
                        <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                          {job.company_logo ? (
                            <img src={job.company_logo} alt="" width={36} height={36}
                              style={{ borderRadius:8, objectFit:'cover', flexShrink:0 }} />
                          ) : (
                            <div style={{
                              width:36, height:36, borderRadius:8, flexShrink:0,
                              background:'rgba(99,102,241,0.1)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                            }}>
                              <Building2 size={16} color="var(--primary)" />
                            </div>
                          )}

                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                              {job.title}
                            </p>
                            <p style={{ fontSize:12, color:'var(--text-secondary)' }}>{job.company}</p>
                          </div>

                          <span style={{ fontSize:14, fontWeight:700, color:scoreColor(job.match_score), flexShrink:0 }}>
                            {job.match_score}%
                          </span>
                        </div>

                        <ProgressBar value={job.match_score} color="auto" showValue={false} height={4} />

                        {/* Meta row */}
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                          <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text-secondary)' }}>
                            <MapPin size={11} /> {job.location}
                          </span>
                          {job.employment_type && <Badge color="blue" size="sm">{job.employment_type}</Badge>}
                          {job.salary && (
                            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--text-secondary)' }}>
                              <DollarSign size={11} /> {job.salary}
                            </span>
                          )}
                        </div>

                        {/* Skills */}
                        {(matchedSkills.length > 0 || missingSkills.length > 0) && (
                          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                            {matchedSkills.slice(0,4).map(s => <Badge key={`m-${s}`} color="success" size="sm">{s}</Badge>)}
                            {missingSkills.slice(0,4).map(s => <Badge key={`x-${s}`} color="danger" size="sm">{s}</Badge>)}
                          </div>
                        )}

                        {/* Description */}
                        <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.6 }}>
                          {truncate(job.description_preview, 140)}
                        </p>

                        {/* Actions */}
                        <div style={{ display:'flex', gap:8, marginTop:'auto' }}>
                          <Button
                            variant="primary" size="sm" fullWidth
                            icon={<Mail size={12}/>}
                            onClick={() => generate(job, 'cover_letter')}
                          >
                            Cover Letter
                          </Button>
                          <Button
                            variant="secondary" size="sm" fullWidth
                            icon={<Briefcase size={12}/>}
                            onClick={() => generate(job, 'proposal')}
                          >
                            Proposal
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <div className="anim-fadeIn">
            {savedProposals.length === 0 ? (
              <Card><EmptyState icon="📝" title="No proposals yet" desc="Generate your first proposal or cover letter from the top matched jobs." action={<Button variant="primary" size="sm" onClick={() => setActiveTab('generate')}>Generate Now</Button>} /></Card>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {savedProposals.map((p, i) => (
                  <Card key={p.proposal_id} hover className={`anim-fadeInUp delay-${Math.min(i+1,5)}`}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <div>
                        <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:3 }}>{p.job_title}</p>
                        <p style={{ fontSize:12, color:'var(--text-secondary)' }}>{p.company}</p>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <Badge color="purple">{CONTENT_LABELS[p.proposal_type] || p.proposal_type}</Badge>
                        <Badge color={p.status==='draft'?'warning':'success'}>{p.status}</Badge>
                        <Button variant="ghost" size="sm" icon={<Copy size={11}/>}
                          onClick={() => { navigator.clipboard.writeText(p.proposal_text); toast?.success('Copied!'); }}>
                          Copy
                        </Button>
                      </div>
                    </div>
                    <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.7, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {p.proposal_text}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generated content modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalJob ? `${CONTENT_LABELS[modalType]} · ${modalJob.title}` : ''}
      >
        {modalGenerating ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, padding:'32px 0' }}>
            <div style={{
              width:64, height:64, borderRadius:16,
              background:'rgba(99,102,241,0.1)',
              display:'flex', alignItems:'center', justifyContent:'center',
              animation:'pulse 2s ease-in-out infinite',
            }}>
              <Sparkles size={28} color="var(--primary)" />
            </div>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', marginBottom:6 }}>
                AI is crafting your {CONTENT_LABELS[modalType]?.toLowerCase()}...
              </p>
              <p style={{ fontSize:12, color:'var(--text-secondary)' }}>
                Analyzing job requirements and your resume skills
              </p>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:9, height:9, borderRadius:'50%', background:'var(--primary)',
                  animation:`typingDot 1.2s ease ${i*0.2}s infinite`,
                }}/>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <Badge color="success" dot>AI Powered</Badge>
              <Button variant="ghost" size="sm" icon={<RefreshCw size={12}/>}
                onClick={() => modalJob && generate(modalJob, modalType)}>
                Regenerate
              </Button>
            </div>

            <textarea
              value={modalContent}
              onChange={e => setModalContent(e.target.value)}
              style={{
                width:'100%', minHeight:320,
                background:'var(--bg-elevated)', border:'1px solid var(--border)',
                borderRadius:10, padding:14, color:'var(--text-primary)',
                fontSize:13, lineHeight:1.8, resize:'vertical',
                outline:'none', fontFamily:'var(--font)',
              }}
            />

            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <Button variant="secondary" size="sm" icon={copied ? <CheckCircle size={12}/> : <Copy size={12}/>} onClick={copyContent}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="secondary" size="sm" icon={<Download size={12}/>} onClick={downloadPdf}>
                Download PDF
              </Button>
              <Button variant="primary" size="sm" loading={saving} icon={<CheckCircle size={12}/>} onClick={saveContent}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
