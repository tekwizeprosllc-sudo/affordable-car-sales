import DashboardBanner from './admin/DashboardBanner';
import KpiCards from './admin/KpiCards';
import LeadsWorkspace from './admin/LeadsWorkspace';

export default function AdminDashboard({ initialLeads, counts, settings, vehicleIndex }) {
  return (
    <LeadsWorkspace
      initialLeads={initialLeads}
      counts={counts}
      settings={settings}
      vehicleIndex={vehicleIndex}
      showHero={
        <>
          <DashboardBanner />
          <KpiCards counts={counts} />
        </>
      }
    />
  );
}
