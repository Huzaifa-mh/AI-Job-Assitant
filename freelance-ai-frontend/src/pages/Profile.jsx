import { useState, useEffect } from 'react';
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

/* ── Parse resume text into structured sections ── */
function parseResumeText(text = '') {
  if (!text) return {};
  const lines    = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result   = { skills:[], experience:[], education:[], contact:{} };

  // Extract email
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.\w+/);
  if (emailMatch) result.contact.email = emailMatch[0];

  // Extract phone
  const phoneMatch = text.match(/(\+?[\d\s\-().]{8,})/);
  if (phoneMatch) result.contact.phone = phoneMatch[0].trim();

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) result.contact.linkedin = 'https://' + linkedinMatch[0];

  // Extract GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) result.contact.github = 'https://' + githubMatch[0];

  // Skills section
  const skillsIdx = lines.findIndex(l => /^skills?$/i.test(l) || /technical skills/i.test(l));
  if (skillsIdx !== -1) {
    const end = lines.findIndex((l, i) => i > skillsIdx && /^(experience|education|work|project)/i.test(l));
    const skillLines = lines.slice(skillsIdx + 1, end === -1 ? skillsIdx + 10 : end);
    result.skills = skillLines
      .flatMap(l => l.split(/[,·|•]/))
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 30);
  }

  // Simple experience extraction
  const expKeywords = /engineer|developer|designer|analyst|manager|intern|lead/i;
  result.experience = lines
    .filter(l => expKeywords.test(l) && l.length > 10 && l.length < 80)
    .slice(0, 5);

  // Education
  const eduKeywords = /university|college|bachelor|master|bsc|msc|degree|institute/i;
  result.education = lines
    .filter(l => eduKeywords.test(l) && l.length > 5 && l.length < 80)
    .slice(0, 3);

  return result;
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast               = useAppToast();

  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({ full_name: user?.full_name || '' });
  const [resumes,  setResumes]  = useState([]);
  const [parsed,   setParsed]   = useState({});
  const [loading,  setLoading]  = useState(true);
  const [activeTab,setActiveTab]= useState('resume'); // 'resume' | 'settings'

  useEffect(() => {
    resumeAPI.getMine()
      .then(r => {
        const list = r.data || [];
        setResumes(list);
        const processed = list.find(r => r.status === 'processed');
        // We'd need raw_text but it's not returned in list — use what we have
        setParsed(parseResumeText(''));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile({ full_name: form.full_name });
      updateUser({ full_name: form.full_name });
      setEditing(false);
      toast?.success('Profile updated successfully!');
    } catch (e) {
      toast?.error(e.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
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
                <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:16 }}>Contact</p>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {[
                    { icon:Mail,     label:'Email',    value:user?.email,                  href:`mailto:${user?.email}` },
                    { icon:Globe, label:'LinkedIn', value:parsed.contact?.linkedin ? 'View Profile' : 'Not found', href:parsed.contact?.linkedin },
                    { icon:Link2, label:'GitHub',   value:parsed.contact?.github   ? 'View Profile' : 'Not found', href:parsed.contact?.github   },
                    { icon:Phone,    label:'Phone',    value:parsed.contact?.phone || 'Add in resume' },
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
                          <p style={{ fontSize:12, color: value.includes('Not found')||value.includes('Add') ? 'var(--text-muted)' : 'var(--text-primary)' }}>{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

              {!processedResume ? (
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
                  {/* Skills */}
                  <Card>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                      <Code2 size={15} color="var(--primary)" />
                      <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>Technical Skills</p>
                    </div>
                    {parsed.skills?.length > 0 ? (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                        {parsed.skills.map(s => (
                          <span key={s} style={{
                            padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:500,
                            background:'rgba(99,102,241,0.1)', color:'#A5B4FC',
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
                    {parsed.experience?.length > 0 ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                        {parsed.experience.map((exp, i) => (
                          <div key={i} style={{ display:'flex', gap:12, paddingBottom:12, borderBottom: i<parsed.experience.length-1 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ width:36, height:36, borderRadius:9, background:'rgba(139,92,246,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <Briefcase size={15} color="#8B5CF6" />
                            </div>
                            <div style={{ flex:1 }}>
                              <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:2 }}>{exp}</p>
                              <p style={{ fontSize:11, color:'var(--text-muted)' }}>Extracted from resume</p>
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
                    {parsed.education?.length > 0 ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {parsed.education.map((edu, i) => (
                          <div key={i} style={{ display:'flex', gap:10, padding:'10px 12px', background:'var(--bg-elevated)', borderRadius:10, border:'1px solid var(--border)' }}>
                            <GraduationCap size={14} color="#10B981" style={{ flexShrink:0, marginTop:2 }} />
                            <p style={{ fontSize:13, color:'var(--text-primary)' }}>{edu}</p>
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