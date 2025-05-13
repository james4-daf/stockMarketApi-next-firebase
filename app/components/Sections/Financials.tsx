import { RevenueChart } from '@/app/components/RevenueChart';
import { DividendsGraph } from '@/app/components/Sections/DividendsGraph';
import { Separator } from '../ui/separator';

export default function Financials() {
  return (
    <section>
      <h2 className="p-8 text-xl text-center"> Financials</h2>
      <RevenueChart />
      <Separator className="my-8" />
      <DividendsGraph />
    </section>
  );
}
