import { RevenueChart } from '@/app/components/RevenueChart';
import { DividendsGraph } from '@/app/components/Sections/DividendsGraph';

export default function Financials() {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4">
      <div className="p-6">
        <h2 className="text-center text-xl font-semibold mb-6"> Financials</h2>
        <RevenueChart />

        <DividendsGraph />
      </div>
    </section>
  );
}
