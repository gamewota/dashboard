import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import LoginForm from '../components/LoginForm';
import sidebarMenu, { type MenuItem } from '../components/sidebarConfig';
import { useAuth } from '../hooks/useAuth';
import type { RootState } from '../store';

/** Flattens the nav config into the leaf destinations a user may open. */
function collectDestinations(items: MenuItem[], hasPerm: (p?: string) => boolean): MenuItem[] {
  return items.flatMap((item) => {
    if (item.permission && !hasPerm(item.permission)) return [];
    const self = item.path ? [item] : [];
    const children = item.children ? collectDestinations(item.children, hasPerm) : [];
    return [...self, ...children];
  });
}

const Home = () => {
  const auth = useAuth();
  type Role = { permissions?: string[] };
  const user = useSelector((s: RootState) => s.auth.user);

  const destinations = useMemo(() => {
    const permissions = (user?.roles ?? []).flatMap((r: Role) => r.permissions ?? []) as string[];
    const hasPerm = (p?: string) => (p ? permissions.includes(p) : true);
    return sidebarMenu.flatMap((group) =>
      collectDestinations(group.children ?? [], hasPerm).map((item) => ({
        ...item,
        group: group.label,
      })),
    );
  }, [user]);

  if (!auth.user) return <LoginForm />;

  const displayName = auth.user.username || auth.user.first_name || 'there';

  return (
    <Container justify="start" className="flex-col">
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Jump straight to a section, or use the sidebar to navigate."
      />

      <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {destinations.map((item) => (
          <Link key={item.path} to={item.path!} className="group block">
            <Card className="h-full transition-colors group-hover:border-primary/60">
              <div className="flex items-start gap-3">
                {item.icon && <span className="text-base-content/50 shrink-0">{item.icon}</span>}
                <div className="min-w-0">
                  <div className="font-semibold truncate group-hover:text-primary transition-colors">
                    {item.label}
                  </div>
                  <div className="mt-0.5 text-xs uppercase tracking-wide text-base-content/40">
                    {item.group}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
};

export default Home;
