"use client"

import {useAuth} from "@/app/hooks/useAuth";
// import { useAuth } from './hooks/useAuth';
import {signOutFromGoogle} from "@/app/firebase/firebase";
import Login from "@/app/components/Login";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    console.log("userData", user);
    return !loading &&(
        <div className='p-4'>
            {user ? (
                <>
                <h1>{user?.displayName}</h1>
                <h1>{user?.email}</h1>
                <button
                    onClick={signOutFromGoogle}
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                    Logout
                </button>
                </>
            ) :
                (

                    <>
                        <Login />
                    </>
                )


            }
        </div>
    )
}