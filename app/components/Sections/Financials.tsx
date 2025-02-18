import {RevenueChart} from "@/app/components/RevenueChart";
import {DividendsGraph} from "@/app/components/Sections/DividendsGraph";

export default function Financials()   {
    return (
        <section>

            <h2 className="p-8 text-xl text-center"> Financials</h2>
            <RevenueChart />
            <DividendsGraph />
        </section>
    )
}