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
} from "@/components/ui/command"
import {useState} from "react";
import {useRouter} from "next/navigation";


export function SearchBar() {
    const [searchText, setSearchText] = useState<null | string>("");
    const router = useRouter()
    const stockSearch= (e) => {
        e.preventDefault();
        if (!searchText.trim()) return;
        router.push(`/${searchText?.trim()}`)
        setSearchText("")
    }
    return (
        <Command className="rounded-lg border shadow-md md:min-w-[450px]">
            <form onSubmit={stockSearch}>

            <CommandInput placeholder="Type a command or search..." value={searchText}
                          onValueChange={setSearchText} />
            <CommandList>
                {!searchText &&
                <CommandEmpty>No results found.</CommandEmpty>
                }
            </CommandList>
                <button type="submit">Search</button>
            </form>
        </Command>
    )
}
