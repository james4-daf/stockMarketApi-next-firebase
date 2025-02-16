"use client"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/app/components/ui/command"
import {useState} from "react";
import {useRouter} from "next/navigation";


export function SearchBar() {
    const [searchText, setSearchText] = useState<string>("");
    const router = useRouter()
    const [error, setError] = useState<string | null>(null);
    const stockSearch= (e?: React.FormEvent | KeyboardEvent) => {
        if (e) e.preventDefault();
        if (!searchText.trim()) {
            setError('Ticker cannot be empty.');
            return;
        }
        router.push(`/${searchText?.trim()}`)
        setSearchText("")
    }
    return (
        <div className=''>

            <form onSubmit={stockSearch}>

            <input className='p-6 border-2 border-indigo-600 rounded-md w-[300px]' value={searchText}
                          type={'text'}
                          placeholder="Enter a stock ticker e.g tsla"
                   onChange={(e) => setSearchText(e.target.value)}
                          // onChange={(e) => setSearchText(e.target.value)}
                          onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                  stockSearch(e);
                              }
                          }}
            />
                {/* ✅ Ensure CommandList is only rendered if searchText exists */}
                {/*{searchText.length > 0 ? (*/}
                {/*    <CommandList>*/}
                {/*        <CommandEmpty>No results found.</CommandEmpty>*/}
                {/*    </CommandList>*/}
                {/*) : null}*/}
                <button type="submit" className='p-2'>Search</button>
            </form>

    {error && <div className="text-red-500">{error}</div>}
        </div>
    )
}
