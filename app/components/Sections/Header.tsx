import { SearchBar } from '@/app/components/SearchBar';

export default function Header() {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <SearchBar />
      </div>
    </div>
  );
}
