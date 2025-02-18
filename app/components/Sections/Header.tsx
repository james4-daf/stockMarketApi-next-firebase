import {SearchBar} from "@/app/components/SearchBar";
import {useAuth} from "@/app/hooks/useAuth";
import {signOutFromGoogle} from "@/app/firebase/firebase";

export default function Header() {
    const { user, loading } = useAuth()

    return (
        <div className="grid grid-cols-12 gap-2 p-8">
            <div className="col-span-6 col-start-4 flex justify-center ">

            <SearchBar />
            </div>
            {user && (
                <div className="col-span-2 col-start-11    ">
                    <button
                        onClick={signOutFromGoogle}
                        className="px-4 py-2 bg-red-500 text-white rounded-md"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    )
}