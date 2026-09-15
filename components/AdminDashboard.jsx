import DashboardBanner from './admin/DashboardBanner';
import KpiCards from './admin/KpiCards';
import LeadsWorkspace from './admin/LeadsWorkspace';

export default function AdminDashboard({ initialLeads, counts, settings }) {
  return (
    <LeadsWorkspace
      initialLeads={initialLeads}
      counts={counts}
      settings={settings}
      showHero={
        <>
          <DashboardBanner />
          <KpiCards counts={counts} />
        </>
      }
    />
  );
}
