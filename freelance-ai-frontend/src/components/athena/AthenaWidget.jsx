import { useAuth } from '../../context/AuthContext';
import { AthenaProvider } from './AthenaProvider';
import AthenaButton from './AthenaButton';
import AthenaPanel from './AthenaPanel';

// Mounted once at the app root. Renders nothing on public pages (no user) —
// this is what makes Athena "available on every authenticated page" without
// touching routing, the Protected wrapper, or any individual page.
export default function AthenaWidget() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <AthenaProvider>
      <AthenaButton />
      <AthenaPanel />
    </AthenaProvider>
  );
}
