import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";

export default function Home() {
    let [token,setToken] = useState(null);
    let router = useRouter();

    useEffect(()=> {
        let servers = JSON.parse(localStorage?.getItem("servers") || "[]");
        let id = parseInt(router.query.server as string) || 0;
        let server = servers[id];
        if(server)
            setToken(server.token);
        else
            setToken(null);
    }, [router.query, router]);

    if(!token) {
        return (<>Server does not exist. Please go back.</>)
    }

    return (
        <div
            className="flex flex-col items-center justify-center py-2 h-screen min-w-96 w-96 max-w-96"
        >
            {token}
        </div>
    );
}
