"use client"

import {useAuth} from "@/app/hooks/useAuth";
import Login from "@/app/components/Login";

export default function StockLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {


    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }
    if (!user) {
        return <Login />; // Show centered login when not logged in
    }
    return (

<>



        {children}

</>



    );
}
