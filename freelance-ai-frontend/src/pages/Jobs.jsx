import { useState, useEffect } from 'react';
import { jobsAPI, matchAPI, resumeAPI, applyAPI } from '../services/api';
import { scoreColor, parseMissingSkills, truncate } from '../utils/helpers';
import AppLayout     from '../components/layout/AppLayout';
import { useAppToast } from '../components/layout/AppLayout';
import Card          from '../components/ui/Card';
import Button        from '../components/ui/Button';
import Badge         from '../components/ui/Badge';
import Input         from '../components/ui/Input';
import Spinner       from '../components/ui/Spinner';
import ProgressBar   from '../components/ui/ProgressBar';
import EmptyState    from '../components/ui/EmptyState';
import {
  Search, Briefcase, MapPin, Building2,
  ExternalLink, Zap, Filter, RefreshCw,
  ChevronLeft, ChevronRight, X, Sparkles,
} from 'lucide-react';

/* ── Fetch form defaults ── */
const DEFAULT_FETCH = {
  query:            'developer jobs',
  country:          'Pakistan',
  date_posted:      'week',
  employment_types: 'FULLTIME',
};

export default function Jobs() {
  const toast = useAppToast();

  // Data
  const [jobs,       setJobs]       = useState([]);
  const [resumes,    setResumes]    = useState([]);
  const [matches,    setMatches]    = useState({});
  const [selected,   setSelected]   = useState(null);

  // UI state
  const [loading,    setLoading]    = useState(true);
  const [fetching,   setFetching]   = useState(false);
  const [matchingId, setMatchingId] = useState(null);
  const [showFetch,  setShowFetch]  = useState(false);
  const [scanning,   setScanning]   = useState(false);

  // Pagination & search
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);

  // Forms
  const [fetchForm,   setFetchForm]  = useState(DEFAULT_FETCH);
  const [scanResult,  setScanResult] = useState(null);

  /* ── Load jobs ── */
  const loadJobs = async (p = 1, s = search) => {
    setLoading(true);
    try {
      const { data } = await jobsAPI.getAll({ search: s, page: p, limit: 10 });
      setJobs(data.jobs        || []);
      setTotal(data.total      || 0);
      setTotalPages(data.total_pages || 1);
    } catch { setJobs([]); }
    finally  { setLoading(false); }
  };

  /* ── Initial load ── */
  useEffect(() => {
    loadJobs();
    resumeAPI.getMine().then(r => setResumes(r.data || [])).catch(() => {});
    matchAPI.getResults().then(r => {
      const map = {};
      (r.data?.results || []).forEach(x => { map[x.job_id] = x; });
      setMatches(map);
    }).catch(() => {});
  }, []);

  /* ── Search ── */
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadJobs(1, search);
  };

  /* ── Fetch from LinkedIn ── */
  const fetchJobs = async () => {
    setFetching(true);
    try {
      const { data } = await jobsAPI.fetch(fetchForm);
      toast?.success(`✅ Fetched ${data.inserted} new jobs (${data.skipped} duplicates skipped)`);
      setShowFetch(false);
      loadJobs();
    } catch (e) {
      toast?.error(e.response?.data?.message || '❌ Fetch failed. Check your RapidAPI key.');
    } finally { setFetching(false); }
  };

  /* ── Match single job ── */
  const matchSingle = async (job_id) => {
    const processed = resumes.find(r => r.status === 'processed');
    if (!processed) {
      toast?.error('Please upload and process a resume first.');
      return;
    }
    setMatchingId(job_id);
    try {
      const { data } = await matchAPI.matchJob({
        resume_id: processed.resume_id,
        job_id,
      });
      setMatches(m => ({
        ...m,
        [job_id]: {
          match_score:    data.match_score,
          missing_skills: data.missing_skills,
        },
      }));
      toast?.success(`Match score: ${data.match_score}%`);
    } catch (e) {
      toast?.error(e.response?.data?.message || 'Matching failed.');
    } finally { setMatchingId(null); }
  };

  /* ── Scan for apply ── */
  const scanJob = async (job) => {
    if (!job.job_url) { toast?.error('This job has no apply URL.'); return; }
    setScanning(true);
    setScanResult(null);
    try {
      const { data } = await applyAPI.scan({ job_id: job.job_id });
      setScanResult(data);
      if (data.scan?.success) {
        toast?.success(`Found ${data.scan.field_count} fillable fields`);
      } else {
        toast?.warning(data.scan?.message || 'Could not scan this page.');
      }
    } catch (e) {
      toast?.error(e.response?.data?.message || 'Scan failed.');
    } finally { setScanning(false); }
  };

  /* ── Pagination ── */
  const goPage = (p) => { setPage(p); loadJobs(p); };

  return (
    <AppLayout>
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

        {/* ── Header ── */}
        <div className="anim-fadeInUp" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
              Job Matching
            </h1>
            <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
              {total} jobs cached · matched against your resume skills
            </p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<Filter size={13} />}
              onClick={() => setShowFetch(s => !s)}
            >
              {showFetch ? 'Close' : 'Fetch Jobs'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={13} />}
              onClick={() => loadJobs()}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Fetch panel ── */}
        {showFetch && (
          <Card className="anim-fadeInUp">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>
                Fetch Jobs via JSearch API
              </p>
              <button
                onClick={() => setShowFetch(false)}
                style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr auto', gap:12, alignItems:'flex-end' }}>
              <Input
                label="Search Query"
                placeholder="react developer"
                value={fetchForm.query}
                onChange={e => setFetchForm(f => ({ ...f, query: e.target.value }))}
              />
              <Input
                label="Country"
                placeholder="Pakistan"
                value={fetchForm.country}
                onChange={e => setFetchForm(f => ({ ...f, country: e.target.value }))}
              />
              <div>
                <label style={{ fontSize:12, fontWeight:500, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>
                  Date Posted
                </label>
                <select
                  value={fetchForm.date_posted}
                  onChange={e => setFetchForm(f => ({ ...f, date_posted: e.target.value }))}
                  style={{
                    width:'100%', background:'var(--bg-elevated)',
                    border:'1px solid var(--border-light)', borderRadius:10,
                    padding:'10px 12px', color:'var(--text-primary)', fontSize:13, outline:'none',
                  }}
                >
                  {['today','week','month','all'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:500, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>
                  Job Type
                </label>
                <select
                  value={fetchForm.employment_types}
                  onChange={e => setFetchForm(f => ({ ...f, employment_types: e.target.value }))}
                  style={{
                    width:'100%', background:'var(--bg-elevated)',
                    border:'1px solid var(--border-light)', borderRadius:10,
                    padding:'10px 12px', color:'var(--text-primary)', fontSize:13, outline:'none',
                  }}
                >
                  {['FULLTIME','PARTTIME','CONTRACTOR','INTERN'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <Button
                variant="primary"
                icon={<Zap size={13} />}
                loading={fetching}
                onClick={fetchJobs}
              >
                Fetch
              </Button>
            </div>
          </Card>
        )}

        {/* ── Main content ── */}
        <div
          className="anim-fadeInUp delay-1"
          style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:20 }}
        >

          {/* ── Job list ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

            {/* Search bar */}
            <form onSubmit={handleSearch} style={{ display:'flex', gap:10 }}>
              <div style={{ flex:1 }}>
                <Input
                  placeholder="Search by title, company or skill..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  icon={<Search size={14} />}
                />
              </div>
              <Button variant="primary" type="submit" icon={<Search size={13} />}>
                Search
              </Button>
            </form>

            {/* Jobs */}
            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:48 }}>
                <Spinner size={32} thickness={3} />
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <EmptyState
                  icon="💼"
                  title="No jobs found"
                  desc="Fetch jobs from LinkedIn via the JSearch API to get started."
                  action={
                    <Button variant="primary" size="sm" onClick={() => setShowFetch(true)}>
                      Fetch Jobs
                    </Button>
                  }
                />
              </Card>
            ) : (
              <>
                {jobs.map((job, i) => {
                  const m         = matches[job.job_id];
                  const isSelected = selected?.job_id === job.job_id;

                  return (
                    <div
                      key={job.job_id}
                      className={`anim-fadeInUp delay-${Math.min(i + 1, 5)}`}
                      onClick={() => setSelected(isSelected ? null : job)}
                      style={{
                        background:   isSelected
                          ? 'rgba(99,102,241,0.06)'
                          : 'var(--bg-card)',
                        border:       `1px solid ${isSelected ? 'rgba(99,102,241,0.35)' : 'var(--border)'}`,
                        borderRadius: 14,
                        padding:      '16px 18px',
                        cursor:       'pointer',
                        transition:   'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-light)';
                          e.currentTarget.style.transform   = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.transform   = 'translateY(0)';
                        }
                      }}
                    >
                      {/* Top row */}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:6, alignItems:'center', marginBottom:5 }}>
                            <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>
                              {job.title}
                            </p>
                            {m && (
                              <Badge
                                color={
                                  m.match_score >= 70 ? 'success' :
                                  m.match_score >= 50 ? 'warning' : 'danger'
                                }
                              >
                                {m.match_score}% match
                              </Badge>
                            )}
                          </div>

                          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text-secondary)' }}>
                              <Building2 size={11} /> {job.company}
                            </span>
                            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text-secondary)' }}>
                              <MapPin size={11} /> {job.location}
                            </span>
                            {job.source && (
                              <span style={{ fontSize:11, color:'var(--text-muted)' }}>
                                via {job.source}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div
                          style={{ display:'flex', gap:6, flexShrink:0 }}
                          onClick={e => e.stopPropagation()}
                        >
                          {!m && (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<Zap size={11} />}
                              loading={matchingId === job.job_id}
                              onClick={() => matchSingle(job.job_id)}
                            >
                              Match
                            </Button>
                          )}
                          {job.job_url && (
                            <a href={job.job_url} target="_blank" rel="noreferrer">
                              <Button variant="ghost" size="sm" icon={<ExternalLink size={11} />}>
                                Apply
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Description preview */}
                      {job.description_preview && (
                        <p style={{
                          fontSize:   12,
                          color:      'var(--text-secondary)',
                          marginTop:  10,
                          lineHeight: 1.6,
                          display:    '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient:'vertical',
                          overflow:   'hidden',
                        }}>
                          {job.description_preview}
                        </p>
                      )}

                      {/* Match bar if matched */}
                      {m && (
                        <div style={{ marginTop:10 }}>
                          <ProgressBar value={m.match_score} color={scoreColor(m.match_score)} color="auto" showValue={false} height={4} />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display:'flex', gap:8, justifyContent:'center', alignItems:'center', marginTop:4 }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<ChevronLeft size={13} />}
                      disabled={page === 1}
                      onClick={() => goPage(page - 1)}
                    >
                      Prev
                    </Button>
                    <span style={{ fontSize:13, color:'var(--text-secondary)', padding:'0 8px' }}>
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<ChevronRight size={13} />}
                      disabled={page === totalPages}
                      onClick={() => goPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Detail panel ── */}
          <div style={{ position:'sticky', top:88 }}>
            {selected ? (
              <Card style={{ display:'flex', flexDirection:'column', gap:0, padding:0, overflow:'hidden' }}>

                {/* Header */}
                <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:3 }}>
                        {selected.title}
                      </p>
                      <p style={{ fontSize:12, color:'var(--text-secondary)' }}>
                        {selected.company} · {selected.location}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', flexShrink:0 }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {selected.job_url && (
                      <a href={selected.job_url} target="_blank" rel="noreferrer" style={{ flex:1 }}>
                        <Button variant="primary" size="sm" icon={<ExternalLink size={12} />} fullWidth>
                          Apply Now
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Sparkles size={12} />}
                      loading={scanning}
                      onClick={() => scanJob(selected)}
                    >
                      AI Fill
                    </Button>
                    {!matches[selected.job_id] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Zap size={12} />}
                        loading={matchingId === selected.job_id}
                        onClick={() => matchSingle(selected.job_id)}
                      >
                        Match
                      </Button>
                    )}
                  </div>
                </div>

                {/* Match score */}
                {matches[selected.job_id] && (
                  <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'rgba(99,102,241,0.04)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <p style={{ fontSize:12, color:'var(--text-secondary)' }}>Match Score</p>
                      <p style={{
                        fontSize:   20,
                        fontWeight: 800,
                        color:      scoreColor(matches[selected.job_id].match_score),
                      }}>
                        {matches[selected.job_id].match_score}%
                      </p>
                    </div>
                    <ProgressBar
                      value={matches[selected.job_id].match_score}
                      color="auto"
                      showValue={false}
                      height={6}
                    />

                    {/* Missing skills */}
                    {parseMissingSkills(matches[selected.job_id].missing_skills).length > 0 && (
                      <div style={{ marginTop:12 }}>
                        <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6 }}>
                          Missing skills:
                        </p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                          {parseMissingSkills(matches[selected.job_id].missing_skills)
                            .slice(0, 6)
                            .map(s => <Badge key={s} color="danger" size="sm">{s}</Badge>)
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Scan result */}
                {scanResult?.scan?.success && (
                  <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'rgba(16,185,129,0.04)' }}>
                    <p style={{ fontSize:12, fontWeight:600, color:'#10B981', marginBottom:8 }}>
                      ✅ {scanResult.scan.field_count} fields detected
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                      {scanResult.scan.fields?.slice(0,4).map((f, i) => (
                        <div key={i} style={{ display:'flex', gap:6, alignItems:'center' }}>
                          <div style={{ width:5, height:5, borderRadius:'50%', background:'#10B981', flexShrink:0 }} />
                          <p style={{ fontSize:11, color:'var(--text-secondary)' }}>
                            {f.label || f.name || 'Field'} ({f.type})
                          </p>
                        </div>
                      ))}
                      {scanResult.scan.fields?.length > 4 && (
                        <p style={{ fontSize:11, color:'var(--text-muted)' }}>
                          +{scanResult.scan.fields.length - 4} more fields
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div style={{ padding:'14px 20px', flex:1, overflowY:'auto', maxHeight:280 }}>
                  <p style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
                    Description
                  </p>
                  <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.8 }}>
                    {selected.description_preview || 'No description available.'}
                  </p>
                </div>
              </Card>
            ) : (
              <Card style={{ textAlign:'center', padding:48 }}>
                <Briefcase size={32} color="var(--text-muted)" style={{ margin:'0 auto 12px' }} />
                <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
                  Click any job to see details, match score, and apply options
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}