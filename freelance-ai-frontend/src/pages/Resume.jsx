import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI, matchAPI } from '../services/api';
import { getFileName, formatDate } from '../utils/helpers';
import AppLayout   from '../components/layout/AppLayout';
import { useAppToast } from '../components/layout/AppLayout';
import Card        from '../components/ui/Card';
import Button      from '../components/ui/Button';
import Badge       from '../components/ui/Badge';
import Spinner     from '../components/ui/Spinner';
import EmptyState  from '../components/ui/EmptyState';
import Modal       from '../components/ui/Modal';
import {
  Upload, FileText, CheckCircle, AlertCircle,
  Sparkles, RefreshCw, Briefcase, Trash2, Clock, Star,
} from 'lucide-react';

const HOW_IT_WORKS = [
  { step:'01', title:'Upload PDF or DOCX', desc:'Drag and drop your resume file. Max 5MB supported.' },
  { step:'02', title:'AI Extracts Skills',  desc:'Python FastAPI uses PyMuPDF + spaCy NLP to extract skills, experience, and contact info from the raw text.' },
  { step:'03', title:'Match Against Jobs',  desc:'Click "Match Jobs" to run cosine similarity scoring against all cached LinkedIn jobs in the database.' },
  { step:'04', title:'Review Results',      desc:'See match percentages, missing skills, and apply with AI form-filling assistance.' },
];

const TIPS = [
  'Include a clear Skills section with specific technologies',
  'Add your LinkedIn and GitHub profile URLs',
  'Include your phone number for AI form auto-filling',
  'Use bullet points for experience with action verbs',
  'Keep your resume under 2 pages for best parsing accuracy',
];

export default function Resume() {
  const navigate  = useNavigate();
  const toast     = useAppToast();
  const fileRef   = useRef();

  const [resumes,   setResumes]   = useState([]);
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [matching,  setMatching]  = useState(null); // resume_id being matched
  const [polling,   setPolling]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activatingId, setActivatingId] = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);
  const [retryingId,   setRetryingId]   = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null); // resume pending delete confirmation

  // Tracks the live setInterval id (not just for rendering) so it can always be cleared,
  // and whether the component is still mounted so a late poll tick never touches state
  // (or triggers a toast) after the user has navigated away.
  const pollIntervalRef = useRef(null);
  const isMountedRef    = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  /* ── Fetch resumes ── */
  const fetchResumes = async () => {
    try {
      const { data } = await resumeAPI.getAll();
      if (isMountedRef.current) setResumes(data || []);
    } catch { /* silent */ }
    finally { if (isMountedRef.current) setLoading(false); }
  };

  /* ── Set a resume as active ── */
  const setActive = async (resumeId) => {
    setActivatingId(resumeId);
    try {
      await resumeAPI.activate(resumeId);
      if (isMountedRef.current)
        setResumes(list => list.map(r => ({ ...r, is_active: r.resume_id === resumeId })));
      toast?.success('Active resume updated.');
    } catch (e) {
      toast?.error(e.response?.data?.message || 'Failed to set active resume.');
    } finally {
      if (isMountedRef.current) setActivatingId(null);
    }
  };

  /* ── Delete a resume ── */
  const deleteResume = async () => {
    if (!confirmTarget) return;
    const resumeId = confirmTarget.resume_id;
    setDeletingId(resumeId);
    try {
      const { data } = await resumeAPI.remove(resumeId);
      if (isMountedRef.current) {
        setResumes(data.resumes || []);
        setConfirmTarget(null);
      }
      toast?.success(data.message || 'Resume deleted successfully.');
    } catch (e) {
      toast?.error(e.response?.data?.message || 'Failed to delete resume.');
    } finally {
      if (isMountedRef.current) setDeletingId(null);
    }
  };

  useEffect(() => { fetchResumes(); }, []);

  /* ── Retry an errored resume: remove it and prompt a fresh upload ── */
  const retryResume = async (resume) => {
    setRetryingId(resume.resume_id);
    try {
      const { data } = await resumeAPI.remove(resume.resume_id);
      if (isMountedRef.current) setResumes(data.resumes || []);
      toast?.info('Removed the failed resume. Please upload it again.');
      fileRef.current?.click();
    } catch (e) {
      toast?.error(e.response?.data?.message || 'Failed to remove the errored resume.');
    } finally {
      if (isMountedRef.current) setRetryingId(null);
    }
  };

  /* ── Upload handler ── */
  const uploadFile = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      toast?.error('Only PDF and DOCX files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast?.error('File size must be under 5MB.');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const { data } = await resumeAPI.upload(fd);

      toast?.success(`Resume uploaded! Processing started...`);
      fetchResumes();

      // Poll until the resume leaves 'pending' — processed, failed, or errored (timeout/AI crash)
      const id = setInterval(async () => {
        if (!isMountedRef.current) { clearInterval(id); return; }
        try {
          const s = await resumeAPI.getStatus(data.resume_id);
          if (!isMountedRef.current) return;

          if (s.data.status !== 'pending') {
            clearInterval(id);
            pollIntervalRef.current = null;
            setPolling(null);
            fetchResumes();

            if (s.data.status === 'processed') {
              toast?.success('✅ Resume processed! Skills extracted successfully.');
            } else if (s.data.status === 'error' || s.data.status === 'failed') {
              toast?.error('Resume parsing failed or timed out. You can retry or edit details manually.');
            } else {
              toast?.error('❌ Processing failed. Please try again.');
            }
          }
        } catch {
          if (!isMountedRef.current) return;
          clearInterval(id);
          pollIntervalRef.current = null;
          setPolling(null);
        }
      }, 2500);

      pollIntervalRef.current = id;
      setPolling(id);
    } catch (e) {
      toast?.error(e.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      if (isMountedRef.current) setUploading(false);
    }
  };

  /* ── Drag handlers ── */
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); uploadFile(e.dataTransfer.files[0]); };

  /* ── Match all jobs ── */
  const matchJobs = async (resume_id) => {
    setMatching(resume_id);
    try {
      const { data } = await matchAPI.matchAll({ resume_id });
      toast?.success(`✅ Matched against ${data.total_jobs_matched} jobs!`);
      setTimeout(() => { if (isMountedRef.current) navigate('/jobs'); }, 1200);
    } catch (e) {
      toast?.error(e.response?.data?.message || 'Matching failed. Make sure jobs are fetched first.');
    } finally {
      if (isMountedRef.current) setMatching(null);
    }
  };

  const processedCount = resumes.filter(r => r.status === 'processed').length;

  return (
    <AppLayout>
      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

        {/* ── Page header ── */}
        <div className="anim-fadeInUp" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
              Resume Management
            </h1>
            <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
              {resumes.length === 0
                ? 'Upload your first resume to unlock AI job matching'
                : `${resumes.length} resume${resumes.length > 1 ? 's' : ''} uploaded · ${processedCount} processed`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={13} />}
            onClick={fetchResumes}
          >
            Refresh
          </Button>
        </div>

        {/* ── Main grid ── */}
        <div
          className="anim-fadeInUp delay-1"
          style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20 }}
        >

          {/* ── LEFT ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* Upload zone */}
            <Card>
              <p style={{ fontWeight:600, fontSize:15, color:'var(--text-primary)', marginBottom:16 }}>
                Upload Resume
              </p>

              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !uploading && !polling && fileRef.current?.click()}
                style={{
                  border:       `2px dashed ${dragging ? 'var(--primary)' : polling ? '#F59E0B' : 'var(--border-light)'}`,
                  borderRadius: 14,
                  padding:      '48px 32px',
                  textAlign:    'center',
                  cursor:       uploading || polling ? 'default' : 'pointer',
                  background:   dragging
                    ? 'rgba(99,102,241,0.05)'
                    : polling
                    ? 'rgba(245,158,11,0.03)'
                    : 'var(--bg-elevated)',
                  transition:   'all 0.2s ease',
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx"
                  style={{ display:'none' }}
                  onChange={e => uploadFile(e.target.files[0])}
                />

                {/* Uploading state */}
                {uploading && (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
                    <Spinner size={36} thickness={3} />
                    <p style={{ fontSize:14, fontWeight:500, color:'var(--text-primary)' }}>
                      Uploading your resume...
                    </p>
                  </div>
                )}

                {/* Processing state */}
                {!uploading && polling && (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
                    <div style={{
                      width:          56,
                      height:         56,
                      borderRadius:   14,
                      background:     'rgba(245,158,11,0.12)',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      animation:      'pulse 2s ease-in-out infinite',
                    }}>
                      <Sparkles size={24} color="#F59E0B" />
                    </div>
                    <div>
                      <p style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>
                        AI is analyzing your resume...
                      </p>
                      <p style={{ fontSize:12, color:'var(--text-secondary)' }}>
                        Extracting skills, experience, and contact info
                      </p>
                    </div>
                    {/* Typing dots */}
                    <div style={{ display:'flex', gap:5 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width:      8,
                          height:     8,
                          borderRadius:'50%',
                          background: '#F59E0B',
                          animation:  `typingDot 1.2s ease ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Idle state */}
                {!uploading && !polling && (
                  <>
                    <div style={{
                      width:          60,
                      height:         60,
                      borderRadius:   16,
                      background:     dragging ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
                      border:         `1px solid ${dragging ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.2)'}`,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      margin:         '0 auto 18px',
                      transition:     'all 0.2s',
                    }}>
                      <Upload size={24} color="var(--primary)" />
                    </div>
                    <p style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', marginBottom:6 }}>
                      {dragging ? 'Drop to upload' : 'Drag & drop your resume here'}
                    </p>
                    <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:22 }}>
                      Supports PDF, DOCX · Maximum 5MB
                    </p>
                    <Button variant="primary" size="md" icon={<Upload size={13} />}>
                      Browse Files
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Resumes list */}
            <Card>
              <p style={{ fontWeight:600, fontSize:15, color:'var(--text-primary)', marginBottom:16 }}>
                Your Resumes
              </p>

              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:32 }}>
                  <Spinner size={28} />
                </div>
              ) : resumes.length === 0 ? (
                <EmptyState
                  icon="📄"
                  title="No resumes yet"
                  desc="Upload your first resume above to get started."
                />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {resumes.map((r, i) => {
                    const isErrored = r.status === 'error' || r.status === 'failed';
                    return (
                    <div
                      key={r.resume_id}
                      className={`anim-fadeInUp delay-${Math.min(i + 1, 5)}`}
                      style={{
                        background:   'var(--bg-elevated)',
                        border:       `1px solid ${isErrored ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                        borderRadius: 12,
                        padding:      '14px 16px',
                        display:      'flex',
                        flexDirection:'column',
                        gap:          10,
                      }}
                    >
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                      {/* File icon */}
                      <div style={{
                        width:          40,
                        height:         40,
                        borderRadius:   10,
                        background:     r.status === 'processed'
                          ? 'rgba(16,185,129,0.1)'
                          : isErrored
                          ? 'rgba(239,68,68,0.1)'
                          : 'rgba(245,158,11,0.1)',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        flexShrink:     0,
                      }}>
                        {r.status === 'processed'
                          ? <CheckCircle size={18} color="#10B981" />
                          : isErrored
                          ? <AlertCircle size={18} color="#EF4444" />
                          : <Clock       size={18} color="#F59E0B" />
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{
                          fontSize:     13,
                          fontWeight:   600,
                          color:        'var(--text-primary)',
                          whiteSpace:   'nowrap',
                          overflow:     'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: 3,
                        }}>
                          {getFileName(r.file_path)}
                        </p>
                        <p style={{ fontSize:11, color:'var(--text-muted)' }}>
                          Uploaded {formatDate(r.uploaded_at)} · ID #{r.resume_id}
                        </p>
                      </div>

                      {/* Active badge */}
                      {r.is_active && (
                        <Badge color="success" dot>Active</Badge>
                      )}

                      {/* Status badge */}
                      <Badge
                        color={
                          r.status === 'processed' ? 'success' :
                          isErrored               ? 'danger'  : 'warning'
                        }
                        dot={r.status === 'pending'}
                      >
                        {r.status}
                      </Badge>

                      {/* Set as active */}
                      {!r.is_active && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Star size={12} />}
                          loading={activatingId === r.resume_id}
                          onClick={() => setActive(r.resume_id)}
                        >
                          Set as Active
                        </Button>
                      )}

                      {/* Match button */}
                      {r.status === 'processed' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Briefcase size={12} />}
                          loading={matching === r.resume_id}
                          onClick={() => matchJobs(r.resume_id)}
                        >
                          Match Jobs
                        </Button>
                      )}

                      {/* Retry */}
                      {isErrored && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<RefreshCw size={12} />}
                          loading={retryingId === r.resume_id}
                          onClick={() => retryResume(r)}
                        >
                          Retry
                        </Button>
                      )}

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={12} color="#EF4444" />}
                        onClick={() => setConfirmTarget(r)}
                      >
                      </Button>
                    </div>

                    {/* Error banner */}
                    {isErrored && (
                      <div style={{
                        display:'flex', alignItems:'flex-start', gap:8,
                        background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.18)',
                        borderRadius:8, padding:'8px 10px',
                      }}>
                        <AlertCircle size={13} color="#EF4444" style={{ flexShrink:0, marginTop:1 }} />
                        <p style={{ fontSize:11.5, color:'var(--text-secondary)', lineHeight:1.5 }}>
                          Resume parsing failed or timed out. You can retry or edit details manually.
                          {r.is_active && ' This is your active resume — select another below or upload a new one to continue matching.'}
                        </p>
                      </div>
                    )}
                    </div>
                  );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* How it works */}
            <Card>
              <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:18 }}>
                How it works
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                {HOW_IT_WORKS.map(({ step, title, desc }) => (
                  <div key={step} style={{ display:'flex', gap:12 }}>
                    <div style={{
                      width:          30,
                      height:         30,
                      borderRadius:   8,
                      background:     'rgba(99,102,241,0.12)',
                      border:         '1px solid rgba(99,102,241,0.2)',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontSize:       10,
                      fontWeight:     700,
                      color:          'var(--primary)',
                      flexShrink:     0,
                      marginTop:      1,
                    }}>
                      {step}
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:3 }}>
                        {title}
                      </p>
                      <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.6 }}>
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tips */}
            <Card>
              <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:14 }}>
                Tips for best results
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {TIPS.map((tip, i) => (
                  <div key={i} style={{ display:'flex', gap:9, alignItems:'flex-start' }}>
                    <CheckCircle size={12} color="#10B981" style={{ flexShrink:0, marginTop:3 }} />
                    <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.55 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tech stack note */}
            <Card style={{ background:'rgba(99,102,241,0.05)', borderColor:'rgba(99,102,241,0.2)' }}>
              <div style={{ display:'flex', gap:9, marginBottom:8 }}>
                <Sparkles size={13} color="var(--primary)" />
                <p style={{ fontSize:13, fontWeight:600, color:'var(--primary)' }}>Powered by</p>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {['PyMuPDF', 'spaCy NLP', 'FastAPI', 'Python 3.11', 'SQL Server'].map(t => (
                  <span key={t} style={{
                    fontSize:     11,
                    fontWeight:   500,
                    color:        'var(--text-secondary)',
                    background:   'var(--bg-elevated)',
                    border:       '1px solid var(--border)',
                    borderRadius: 6,
                    padding:      '3px 8px',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        title="Delete Resume"
        maxWidth={420}
      >
        <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:20 }}>
          Are you sure you want to delete{' '}
          <strong style={{ color:'var(--text-primary)' }}>
            {confirmTarget ? getFileName(confirmTarget.file_path) : ''}
          </strong>
          ? This will permanently remove the file and cannot be undone.
          {confirmTarget?.is_active && ' Since this is your active resume, the most recently uploaded remaining resume will become active.'}
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Button variant="secondary" size="sm" onClick={() => setConfirmTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={12} />}
            loading={deletingId === confirmTarget?.resume_id}
            onClick={deleteResume}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}