import { SearchBar } from '@/app/components/SearchBar';

export default function Header() {
  return (
    <div className="grid grid-cols-12 gap-2 p-8">
      <div className="col-span-6 col-start-4 flex justify-center ">
        <SearchBar />
      </div>
    </div>
  );
}
