import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, resumeAPI } from '../services/api';
import { useAppToast } from '../components/layout/AppLayout';
import { getInitials, formatDate } from '../utils/helpers';
import AppLayout  from '../components/layout/AppLayout';
import Card       from '../components/ui/Card';
import Button     from '../components/ui/Button';
import Input      from '../components/ui/Input';
import Badge      from '../components/ui/Badge';
import Spinner    from '../components/ui/Spinner';
import {
  User, Mail, Phone, MapPin, Briefcase,
  Code2, Star, GraduationCap, Edit3,
  CheckCircle, Save, Globe, Link2,
  Calendar, FileText, Award,
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast               = useAppToast();

  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({
    full_name:     user?.full_name || '',
    phone:         '',
    linkedin_url:  '',
    github_url:    '',
    portfolio_url: '',
    location:      '',
  });
  const [profile,  setProfile]  = useState(null);
  const [resumes,  setResumes]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeTab,setActiveTab]= useState('resume'); // 'resume' | 'settings'

  // NOTE: this ref must be reset to true on every effect *setup*, not just cleared on
  // cleanup — under React StrictMode (enabled in main.jsx), effects run
  // setup -> cleanup -> setup on mount. An empty-bodied effect that only clears the
  // flag on cleanup leaves it permanently `false` after the simulated remount, which
  // silently short-circuits every later `finally` guarded by it — the exact cause of
  // the spinners getting stuck forever on this page.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const applyProfile = (data) => {
    if (!data) return;
    setProfile(data);
    setForm(f => ({
      ...f,
      full_name:     data.full_name         || f.full_name,
      phone:         data.contact?.phone    || '',
      linkedin_url:  data.contact?.linkedin || '',
      github_url:    data.contact?.github   || '',
      portfolio_url: data.contact?.portfolio|| '',
      location:      data.contact?.location || '',
    }));
  };

  /* ── Initial load: resumes + profile fetched independently in parallel — neither
     one waits on the other, so a slow/failed profile fetch can never block the
     resumes list (or the loading spinner) from resolving, and vice versa. ── */
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [resumeRes, profileRes] = await Promise.all([
        resumeAPI.getAll().catch(() => ({ data: [] })),
        userAPI.getProfile().catch(() => ({ data: null })),
      ]);
      if (!isMountedRef.current) return;

      setResumes(resumeRes.data || []);
      applyProfile(profileRes.data);

      if (!profileRes.data) {
        toast?.error('Could not load extended profile details. Showing basic account info.');
      }
    } catch {
      // Only reachable if Promise.all itself throws synchronously — the per-call
      // .catch() above already absorbs normal request failures.
      if (isMountedRef.current) {
        setResumes([]);
        toast?.error('Failed to load profile data.');
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => { fetchProfileData(); }, []);

  /* ── Re-fetch profile (skills/experience/education/contact) whenever the active resume changes ── */
  const activeResumeId = resumes.find(r => r.is_active)?.resume_id ?? null;
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return; }

    const refreshProfile = async () => {
      setProfileLoading(true);
      try {
        const { data } = await userAPI.getProfile();
        applyProfile(data);
      } catch {
        toast?.error('Failed to refresh profile after resume change.');
      } finally {
        if (isMountedRef.current) setProfileLoading(false);
      }
    };

    refreshProfile();
  }, [activeResumeId]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        full_name:     form.full_name,
        phone:         form.phone,
        linkedin_url:  form.linkedin_url,
        github_url:    form.github_url,
        portfolio_url: form.portfolio_url,
        location:      form.location,
      };
      const { data } = await userAPI.updateProfile(payload);
      updateUser({ full_name: data.full_name });
      setProfile(p => ({ ...p, ...data }));
      setEditing(false);
      toast?.success('Profile updated successfully!');
    } catch (e) {
      toast?.error(e.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  /* ── Inline Contact-card editing ── */
  const [contactEditing, setContactEditing] = useState(false);
  const [contactSaving,  setContactSaving]  = useState(false);
  const [contactForm,    setContactForm]    = useState({
    phone: '', location: '', linkedin: '', github: '', portfolio: '',
  });

  const startEditContact = () => {
    setContactForm({
      phone:     profile?.contact?.phone     || '',
      location:  profile?.contact?.location  || '',
      linkedin:  profile?.contact?.linkedin  || '',
      github:    profile?.contact?.github    || '',
      portfolio: profile?.contact?.portfolio || '',
    });
    setContactEditing(true);
  };

  const saveContact = async () => {
    setContactSaving(true);
    try {
      const { data } = await userAPI.updateProfile({
        phone:     contactForm.phone,
        location:  contactForm.location,
        linkedin:  contactForm.linkedin,
        github:    contactForm.github,
        portfolio: contactForm.portfolio,
      });
      setProfile(p => ({ ...p, ...data }));
      // Keep the Settings-tab form draft in sync so re-opening it doesn't show stale values
      setForm(f => ({
        ...f,
        phone:         data.contact?.phone         || '',
        linkedin_url:  data.contact?.linkedin      || '',
        github_url:    data.contact?.github        || '',
        portfolio_url: data.contact?.portfolio     || '',
        location:      data.contact?.location      || '',
      }));
      setContactEditing(false);
      toast?.success('Contact info updated!');
    } catch (e) {
      toast?.error(e.response?.data?.message || 'Failed to update contact info.');
    } finally {
      setContactSaving(false);
    }
  };

  const processedResume = resumes.find(r => r.status === 'processed');

  const TABS = [
    { key:'resume',   label:'Professional Profile', icon: FileText },
    { key:'settings', label:'Account Settings',     icon: User     },
  ];

  return (
    <AppLayout>
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

        {/* Profile hero */}
        <div
          className="anim-fadeInUp"
          style={{
            background:   'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))',
            border:       '1px solid rgba(99,102,241,0.2)',
            borderRadius: 20,
            padding:      '28px 32px',
            display:      'flex',
            alignItems:   'center',
            gap:          24,
            position:     'relative',
            overflow:     'hidden',
          }}
        >
          <div style={{ position:'absolute', top:'-20px', right:'-20px', width:160, height:160, background:'radial-gradient(ellipse,rgba(139,92,246,0.1),transparent 70%)', pointerEvents:'none' }} />

          {/* Avatar */}
          <div style={{
            width:80, height:80, borderRadius:'50%',
            background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28, fontWeight:700, color:'white',
            boxShadow:'0 8px 24px rgba(99,102,241,0.4)',
            flexShrink:0,
          }}>
            {getInitials(user?.full_name)}
          </div>

          {/* Info */}
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)' }}>
                {user?.full_name}
              </h1>
              <Badge color="primary" dot>Freelancer</Badge>
            </div>
            <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:10 }}>{user?.email}</p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text-muted)' }}>
                <FileText size={11}/> {resumes.length} resume{resumes.length!==1?'s':''}
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text-muted)' }}>
                <CheckCircle size={11} color={processedResume?'#10B981':undefined}/>
                {processedResume ? 'Resume processed' : 'No resume processed'}
              </span>
            </div>
          </div>

          <Button variant="secondary" size="sm" icon={<Edit3 size={13}/>} onClick={() => { setEditing(true); setActiveTab('settings'); }}>
            Edit Profile
          </Button>
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

        {/* Professional profile tab */}
        {activeTab === 'resume' && (
          <div className="anim-fadeIn" style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20 }}>

            {/* Left — contact card */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Card>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>Contact</p>
                  {!contactEditing && (
                    <button
                      onClick={startEditContact}
                      title="Edit contact info"
                      style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', display:'flex', padding:4 }}
                    >
                      <Edit3 size={13} />
                    </button>
                  )}
                </div>

                {contactEditing ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    <Input
                      label="Phone"
                      value={contactForm.phone}
                      onChange={e => setContactForm(f => ({ ...f, phone:e.target.value }))}
                      icon={<Phone size={14}/>}
                      placeholder="+92 300 1234567"
                    />
                    <Input
                      label="Location"
                      value={contactForm.location}
                      onChange={e => setContactForm(f => ({ ...f, location:e.target.value }))}
                      icon={<MapPin size={14}/>}
                      placeholder="Lahore, Pakistan"
                    />
                    <Input
                      label="LinkedIn"
                      value={contactForm.linkedin}
                      onChange={e => setContactForm(f => ({ ...f, linkedin:e.target.value }))}
                      icon={<Globe size={14}/>}
                      placeholder="https://linkedin.com/in/yourname"
                    />
                    <Input
                      label="GitHub"
                      value={contactForm.github}
                      onChange={e => setContactForm(f => ({ ...f, github:e.target.value }))}
                      icon={<Link2 size={14}/>}
                      placeholder="https://github.com/yourname"
                    />
                    <Input
                      label="Portfolio"
                      value={contactForm.portfolio}
                      onChange={e => setContactForm(f => ({ ...f, portfolio:e.target.value }))}
                      icon={<Globe size={14}/>}
                      placeholder="https://yourportfolio.com"
                    />
                    <div style={{ display:'flex', gap:8 }}>
                      <Button variant="primary" size="sm" loading={contactSaving} icon={<Save size={12}/>} onClick={saveContact}>
                        Save Changes
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setContactEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {[
                      { icon:Mail,     label:'Email',     value:profile?.contact?.email || user?.email,                     href:`mailto:${profile?.contact?.email || user?.email}` },
                      { icon:Globe,    label:'LinkedIn',   value:profile?.contact?.linkedin  ? 'View Profile' : 'Not set', href:profile?.contact?.linkedin },
                      { icon:Link2,    label:'GitHub',     value:profile?.contact?.github    ? 'View Profile' : 'Not set', href:profile?.contact?.github   },
                      { icon:Globe,    label:'Portfolio',  value:profile?.contact?.portfolio ? 'View Site'    : 'Not set', href:profile?.contact?.portfolio },
                      { icon:Phone,    label:'Phone',      value:profile?.contact?.phone    || 'Not set' },
                      { icon:MapPin,   label:'Location',   value:profile?.contact?.location || 'Not set' },
                    ].map(({ icon:Icon, label, value, href }) => (
                      <div key={label} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                        <div style={{ width:30, height:30, borderRadius:8, background:'rgba(99,102,241,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Icon size={13} color="var(--primary)" />
                        </div>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</p>
                          {href ? (
                            <a href={href} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'var(--primary)' }}>{value}</a>
                          ) : (
                            <p style={{ fontSize:12, color: value === 'Not set' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Resume files */}
              <Card>
                <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:14 }}>Resumes</p>
                {loading ? <Spinner size={20} /> : resumes.length === 0 ? (
                  <p style={{ fontSize:12, color:'var(--text-muted)' }}>No resumes uploaded</p>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {resumes.map(r => (
                      <div key={r.resume_id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'var(--bg-elevated)', borderRadius:8, border:'1px solid var(--border)' }}>
                        <FileText size={12} color="var(--primary)" />
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:11, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                            {r.file_path?.split(/[/\\]/).pop() || `Resume #${r.resume_id}`}
                          </p>
                          <p style={{ fontSize:10, color:'var(--text-muted)' }}>{formatDate(r.uploaded_at)}</p>
                        </div>
                        <Badge color={r.status==='processed'?'success':r.status==='failed'?'danger':'warning'} size="sm">
                          {r.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right — resume content */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {loading ? (
                <Card><div style={{ display:'flex', justifyContent:'center', padding:32 }}><Spinner size={28} /></div></Card>
              ) : !processedResume ? (
                <Card>
                  <div style={{ textAlign:'center', padding:'32px 24px' }}>
                    <div style={{ width:56, height:56, borderRadius:14, background:'rgba(99,102,241,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                      <FileText size={24} color="var(--primary)" />
                    </div>
                    <p style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', marginBottom:6 }}>
                      Professional Profile
                    </p>
                    <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:20, lineHeight:1.65 }}>
                      Upload and process a resume to populate your professional profile with extracted skills, experience, and education.
                    </p>
                    <Button variant="primary" size="md" icon={<FileText size={13}/>} onClick={() => window.location.href='/resume'}>
                      Upload Resume
                    </Button>
                  </div>
                </Card>
              ) : (
                <>
                  {profileLoading && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text-muted)' }}>
                      <Spinner size={14} /> Refreshing profile for the newly active resume...
                    </div>
                  )}

                  {/* Skills */}
                  <Card>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                      <Code2 size={15} color="var(--primary)" />
                      <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>Technical Skills</p>
                    </div>
                    {profile?.skills?.length > 0 ? (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                        {profile.skills.map(s => (
                          <span key={s} style={{
                            padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:500,
                            background:'rgba(99,102,241,0.1)', color:'var(--badge-primary-text)',
                            border:'1px solid rgba(99,102,241,0.2)',
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize:13, color:'var(--text-muted)' }}>
                        Skills will appear here after resume processing. Add a "Skills" section to your resume for best results.
                      </p>
                    )}
                  </Card>

                  {/* Experience */}
                  <Card>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                      <Briefcase size={15} color="#8B5CF6" />
                      <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>Work Experience</p>
                    </div>
                    {profile?.experience?.length > 0 ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                        {profile.experience.map((exp, i) => (
                          <div key={i} style={{ display:'flex', gap:12, paddingBottom:12, borderBottom: i<profile.experience.length-1 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ width:36, height:36, borderRadius:9, background:'rgba(139,92,246,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <Briefcase size={15} color="#8B5CF6" />
                            </div>
                            <div style={{ flex:1 }}>
                              <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:2 }}>
                                {exp.role || 'Role not detected'}
                                {exp.company && <span style={{ fontWeight:400, color:'var(--text-secondary)' }}> · {exp.company}</span>}
                              </p>
                              <p style={{ fontSize:11, color:'var(--text-muted)' }}>
                                {exp.duration || 'Extracted from resume'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize:13, color:'var(--text-muted)' }}>
                        Experience entries will appear here. Ensure your resume has clear job titles and company names.
                      </p>
                    )}
                  </Card>

                  {/* Education */}
                  <Card>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                      <GraduationCap size={15} color="#10B981" />
                      <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>Education</p>
                    </div>
                    {profile?.education?.length > 0 ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {profile.education.map((edu, i) => (
                          <div key={i} style={{ display:'flex', gap:10, padding:'10px 12px', background:'var(--bg-elevated)', borderRadius:10, border:'1px solid var(--border)' }}>
                            <GraduationCap size={14} color="#10B981" style={{ flexShrink:0, marginTop:2 }} />
                            <div>
                              <p style={{ fontSize:13, color:'var(--text-primary)' }}>
                                {edu.degree || 'Degree not detected'}
                                {edu.institution && <span style={{ color:'var(--text-secondary)' }}> · {edu.institution}</span>}
                              </p>
                              {edu.year && <p style={{ fontSize:11, color:'var(--text-muted)' }}>{edu.year}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize:13, color:'var(--text-muted)' }}>
                        Education details will appear here after resume processing.
                      </p>
                    )}
                  </Card>
                </>
              )}
            </div>
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="anim-fadeIn" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <Card>
              <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:20 }}>
                Account Information
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {editing ? (
                  <>
                    <Input
                      label="Full Name"
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name:e.target.value }))}
                      icon={<User size={14}/>}
                    />
                    <Input label="Email" value={user?.email} disabled icon={<Mail size={14}/>} hint="Email cannot be changed" />
                    <Input
                      label="Phone"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone:e.target.value }))}
                      icon={<Phone size={14}/>}
                      placeholder="+92 300 1234567"
                    />
                    <Input
                      label="Location"
                      value={form.location}
                      onChange={e => setForm(f => ({ ...f, location:e.target.value }))}
                      icon={<MapPin size={14}/>}
                      placeholder="Lahore, Pakistan"
                    />
                    <Input
                      label="LinkedIn URL"
                      value={form.linkedin_url}
                      onChange={e => setForm(f => ({ ...f, linkedin_url:e.target.value }))}
                      icon={<Globe size={14}/>}
                      placeholder="https://linkedin.com/in/yourname"
                    />
                    <Input
                      label="GitHub URL"
                      value={form.github_url}
                      onChange={e => setForm(f => ({ ...f, github_url:e.target.value }))}
                      icon={<Link2 size={14}/>}
                      placeholder="https://github.com/yourname"
                    />
                    <Input
                      label="Portfolio URL"
                      value={form.portfolio_url}
                      onChange={e => setForm(f => ({ ...f, portfolio_url:e.target.value }))}
                      icon={<Globe size={14}/>}
                      placeholder="https://yourportfolio.com"
                    />
                    <div style={{ display:'flex', gap:10 }}>
                      <Button variant="primary" size="md" loading={saving} icon={<Save size={13}/>} onClick={save}>
                        Save Changes
                      </Button>
                      <Button variant="secondary" size="md" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      { label:'Full Name', value:user?.full_name, icon:User   },
                      { label:'Email',     value:user?.email,     icon:Mail   },
                      { label:'Role',      value:user?.role || 'freelancer', icon:Award },
                      { label:'Phone',     value:form.phone         || 'Not set', icon:Phone },
                      { label:'Location',  value:form.location      || 'Not set', icon:MapPin },
                      { label:'LinkedIn',  value:form.linkedin_url  || 'Not set', icon:Globe },
                      { label:'GitHub',    value:form.github_url   || 'Not set', icon:Link2 },
                      { label:'Portfolio', value:form.portfolio_url|| 'Not set', icon:Globe },
                    ].map(({ label, value, icon:Icon }) => (
                      <div key={label} style={{ display:'flex', gap:12, padding:'12px 14px', background:'var(--bg-elevated)', borderRadius:10, border:'1px solid var(--border)' }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:'rgba(99,102,241,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Icon size={13} color="var(--primary)" />
                        </div>
                        <div>
                          <p style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>{label}</p>
                          <p style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)', textTransform:'capitalize' }}>{value}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" size="md" icon={<Edit3 size={13} />} onClick={() => setEditing(true)}>
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
            </Card>

            <Card>
              <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:16 }}>Account Stats</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { label:'Resumes uploaded',  value:resumes.length                                    },
                  { label:'Resumes processed', value:resumes.filter(r=>r.status==='processed').length  },
                  { label:'Account type',      value:'Free plan'                                       },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 12px', background:'var(--bg-elevated)', borderRadius:9, border:'1px solid var(--border)' }}>
                    <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}