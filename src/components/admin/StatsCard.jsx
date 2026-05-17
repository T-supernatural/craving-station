export default function StatsCard({ title, value }) {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-yakoyo-muted mb-2">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}